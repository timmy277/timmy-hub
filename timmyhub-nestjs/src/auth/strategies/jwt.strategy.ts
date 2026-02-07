import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser, JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const { sub, deviceId } = payload;


        // Kiểm tra User còn tồn tại và active không
        const user = await this.prisma.user.findUnique({
            where: { id: sub },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị khóa');
        }

        // Nếu có deviceId thì kiểm tra thiết bị
        if (deviceId) {
            const device = await this.prisma.device.findUnique({
                where: { id: deviceId },
            });

            if (!device || !device.isActive) {
                throw new UnauthorizedException('Thiết bị đã bị đăng xuất');
            }
        }

        return { id: user.id, email: user.email, role: user.role, deviceId };
    }
}
