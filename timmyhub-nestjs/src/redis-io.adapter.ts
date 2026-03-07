import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter> | undefined;
    private readonly logger = new Logger(RedisIoAdapter.name);

    async connectToRedis(): Promise<void> {
        // ⚠️ LƯU Ý CHO UPSTASH REDIS:
        // Socket.io Redis Adapter bắt buộc dùng Pub/Sub, mà Pub/Sub yêu cầu kết nối TCP (không dùng được REST API).
        // Bạn cần truy cập Upstash Dashboard -> Kéo xuống phần "Node.js (ioredis / node-redis)"
        // Copy chuỗi kết nối rediss://... (có port và password) và bỏ vào .env dưới tên UPSTASH_REDIS_TCP_URL

        const redisUrl = process.env.UPSTASH_REDIS_TCP_URL || 'redis://localhost:6379';

        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        pubClient.on('error', err => this.logger.error('Redis Pub Client Error:', err));
        subClient.on('error', err => this.logger.error('Redis Sub Client Error:', err));

        await Promise.all([pubClient.connect(), subClient.connect()]);

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
