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
            useFactory: (configService: ConfigService): Redis => {
                return new Redis({
                    url: configService.getOrThrow<string>('UPSTASH_REDIS_REST_URL'),
                    token: configService.getOrThrow<string>('UPSTASH_REDIS_REST_TOKEN'),
                });
            },
        },
    ],
    exports: [UPSTASH_REDIS],
})
export class RedisModule {}
