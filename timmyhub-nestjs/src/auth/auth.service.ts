import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('Email đã tồn tại');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                phone: dto.phone,
                profile: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        displayName: `${dto.firstName} ${dto.lastName}`,
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        return user;
    }

    async login(dto: LoginDto, ip: string, userAgent: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Tài khoản đã bị khóa');
        }

        // Xử lý Device (Upsert để tránh lỗi Unique constraint nếu đã tồn tại)
        const device = await this.prisma.device.upsert({
            where: { userId: user.id },
            update: {
                ip,
                userAgent,
                deviceName: dto.deviceName || 'Thiết bị không xác định',
                isActive: true,
                lastActiveAt: new Date(),
            },
            create: {
                userId: user.id,
                ip,
                userAgent,
                deviceName: dto.deviceName || 'Thiết bị không xác định',
            },
        });

        const tokens = await this.generateTokens(user.id, device.id);

        // Lưu Refresh Token
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                deviceId: device.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
            },
        });

        // 5. Lấy danh sách quyền (Permissions)
        const userWithPermissions = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                userRoles: {
                    include: {
                        role: { include: { permissions: { include: { permission: true } } } },
                    },
                },
                userPermissions: { include: { permission: true } },
            },
        });

        const permissions = new Set<string>();
        userWithPermissions?.userRoles.forEach((ur) => {
            ur.role.permissions.forEach((rp) => permissions.add(rp.permission.name));
        });
        userWithPermissions?.userPermissions.forEach((up) => {
            permissions.add(up.permission.name);
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                permissions: Array.from(permissions),
            },
            device: {
                id: device.id,
                name: device.deviceName,
            },
            ...tokens,
        };
    }

    async logout(refreshToken: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }

    async refreshTokens(refreshToken: string) {
        const tokenDoc = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { device: true },
        });

        if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.expiresAt < new Date()) {
            throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
        }

        // Revoke token cũ
        await this.prisma.refreshToken.update({
            where: { id: tokenDoc.id },
            data: { isRevoked: true },
        });

        const tokens = await this.generateTokens(tokenDoc.userId, tokenDoc.deviceId);

        // Lưu Refresh Token mới
        await this.prisma.refreshToken.create({
            data: {
                userId: tokenDoc.userId,
                deviceId: tokenDoc.deviceId,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return tokens;
    }

    private async generateTokens(userId: string, deviceId: string | null) {
        const payload = { sub: userId, deviceId };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    async getDevices(userId: string) {
        return this.prisma.device.findMany({
            where: { userId, isActive: true },
            orderBy: { lastActiveAt: 'desc' },
        });
    }

    async logoutDevice(userId: string, deviceId: string) {
        await this.prisma.device.update({
            where: { id: deviceId, userId },
            data: { isActive: false },
        });

        await this.prisma.refreshToken.deleteMany({
            where: { deviceId, userId },
        });
    }
}
