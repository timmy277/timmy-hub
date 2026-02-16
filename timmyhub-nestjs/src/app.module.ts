import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    socket: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: parseInt(configService.get('REDIS_PORT', '6379')),
                    },
                    ttl: 60000 * 60, // 1 hour
                }),
            }),
            inject: [ConfigService],
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
        AuthModule,
        RbacModule,
        UsersModule,
        ProductsModule,
        CategoriesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
