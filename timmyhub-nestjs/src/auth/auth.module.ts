import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCleanupService } from './auth-cleanup.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { RbacModule } from '../rbac/rbac.module';
import { CaslModule } from '../casl/casl.module';

@Module({
    imports: [
        PassportModule,
        RbacModule,
        CaslModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.get('JWT_EXPIRES_IN') || '15m',
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthCleanupService, JwtStrategy, GoogleStrategy, FacebookStrategy],
    exports: [AuthService, AuthCleanupService, JwtModule],
})
export class AuthModule {}
