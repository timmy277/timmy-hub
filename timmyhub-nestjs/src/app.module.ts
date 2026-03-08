import { CaslModule } from './casl/casl.module';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { PromotionCampaignsModule } from './promotion-campaigns/promotion-campaigns.module';
import { SellerModule } from './seller/seller.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from './common/redis/redis.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MetricsMiddleware } from './common/middleware/metrics.middleware';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { SystemLogsModule } from './system-logs/system-logs.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({
            isGlobal: true,
            ttl: 60 * 60 * 1000, // 1 hour
        }),
        RedisModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: config.get('THROTTLE_TTL', 60),
                    limit: config.get('THROTTLE_LIMIT', 10),
                },
            ],
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                transport:
                    process.env.NODE_ENV !== 'production'
                        ? {
                              target: 'pino-pretty',
                              options: {
                                  colorize: true,
                                  singleLine: true,
                                  translateTime: 'SYS:standard',
                              },
                          }
                        : undefined,
            },
        }),
        DatabaseModule,
        HealthModule,
        AuthModule,
        RbacModule,
        UsersModule,
        ProductsModule,
        CategoriesModule,
        SupabaseModule,
        FilesModule,
        CaslModule,
        CartModule,
        OrdersModule,
        PaymentsModule,
        VouchersModule,
        PromotionCampaignsModule,
        SellerModule,
        ReviewsModule,
        ChatModule,
        NotificationsModule,
        WishlistsModule,
        SystemLogsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply metrics middleware to all routes except health/metrics
        consumer.apply(MetricsMiddleware).exclude('health/(.*)', 'metrics/(.*)').forRoutes('*');
    }
}
