import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter> | undefined;
    private readonly logger = new Logger(RedisIoAdapter.name);

    async connectToRedis(): Promise<void> {
        const redisUrl = process.env.UPSTASH_REDIS_TCP_URL || 'redis://localhost:6379';
        this.logger.log(
            `Attempting to connect to Redis: ${redisUrl.replace(/:[^:@]+@/, ':****@')}`,
        );

        const pubClient = createClient({
            url: redisUrl,
            socket: {
                connectTimeout: 5000, // 5 seconds timeout
                reconnectStrategy: retries => {
                    if (retries > 3) {
                        this.logger.error('Redis connection failed after 3 retries');
                        return new Error('Max retries reached');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });
        const subClient = pubClient.duplicate();

        pubClient.on('error', err => this.logger.error('Redis Pub Client Error:', err));
        subClient.on('error', err => this.logger.error('Redis Sub Client Error:', err));

        // Add timeout to connection attempt
        const connectWithTimeout = Promise.race([
            Promise.all([pubClient.connect(), subClient.connect()]),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error('Redis connection timeout after 10 seconds')),
                    10000,
                ),
            ),
        ]);

        await connectWithTimeout;

        this.adapterConstructor = createAdapter(pubClient, subClient);
        this.logger.log(`✅ Connected to Upstash Redis as Socket.IO Adapter`);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        } else {
            this.logger.warn('Redis adapter is not initialized. Falling back to default adapter.');
        }
        return server;
    }
}
