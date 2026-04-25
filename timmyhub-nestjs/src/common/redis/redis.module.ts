/**
 * RedisModule - Cung cấp Upstash Redis client toàn cục
 */
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

export const UPSTASH_REDIS = 'UPSTASH_REDIS';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: UPSTASH_REDIS,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): Redis | null => {
                const url = configService.get<string>('UPSTASH_REDIS_REST_URL');
                const token = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
                if (!url || !token) {
                    console.warn('⚠️  UPSTASH_REDIS not configured, Redis features disabled');
                    return null;
                }
                return new Redis({ url, token });
            },
        },
    ],
    exports: [UPSTASH_REDIS],
})
export class RedisModule {}
