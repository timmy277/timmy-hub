import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    Logger,
    Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RbacService } from '../rbac/rbac.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { AuthCleanupService } from './auth-cleanup.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly rbacService: RbacService,
        private readonly caslAbilityFactory: CaslAbilityFactory,
        private readonly authCleanupService: AuthCleanupService,
    ) {}

    async register(dto: RegisterDto) {
        this.logger.log(`Yêu cầu đăng ký tài khoản mới: ${dto.email}`);
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
        this.logger.log(`Yêu cầu đăng nhập: ${dto.email}`);
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Tài khoản đã bị khóa');
        }

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

        const refreshMaxAge = this.getRefreshCookieMaxAge();
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                deviceId: device.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + refreshMaxAge),
            },
        });

        // 5. Build permissions & Ability
        const userWithPermissions = await this.rbacService.getUserWithPermissions(user.id);

        if (!userWithPermissions) {
            throw new UnauthorizedException('Không thể lấy thông tin phân quyền người dùng');
        }

        // Build CASL Ability
        const ability = this.caslAbilityFactory.createForUser(userWithPermissions);

        const permissions = new Set<string>();
        userWithPermissions.userRoles.forEach(ur => {
            ur.role.permissions.forEach(rp => permissions.add(rp.permission.name));
        });
        userWithPermissions.userPermissions.forEach(up => {
            permissions.add(up.permission.name);
        });

        const permissionList = Array.from(permissions);

        // Update Cache
        await this.cacheManager.set(`user_permissions:${user.id}`, permissionList, 600000);

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                permissions: permissionList,
                rules: ability.rules, // Send CASL rules to FE
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
        // Validate input
        if (!refreshToken) {
            this.logger.warn('❌ Refresh token missing in request');
            throw new UnauthorizedException('Refresh token không tồn tại');
        }

        const tokenDoc = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { device: true },
        });

        if (!tokenDoc) {
            this.logger.warn('❌ Refresh token not found in database');
            throw new UnauthorizedException('Phiên đăng nhập không tồn tại');
        }

        if (tokenDoc.isRevoked) {
            this.logger.warn(`❌ Refresh token was revoked for user ${tokenDoc.userId}`);
            throw new UnauthorizedException('Phiên đăng nhập đã bị thu hồi');
        }

        if (tokenDoc.expiresAt < new Date()) {
            this.logger.warn(`❌ Refresh token expired for user ${tokenDoc.userId}`);
            // Auto cleanup expired token
            await this.prisma.refreshToken.delete({ where: { id: tokenDoc.id } });
            throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        }

        this.logger.log(`✅ Refreshing tokens for user ${tokenDoc.userId}`);

        // Revoke token cũ
        await this.prisma.refreshToken.update({
            where: { id: tokenDoc.id },
            data: { isRevoked: true },
        });

        const tokens = await this.generateTokens(tokenDoc.userId, tokenDoc.deviceId);

        // Lưu Refresh Token mới
        const refreshMaxAge = this.getRefreshCookieMaxAge();
        await this.prisma.refreshToken.create({
            data: {
                userId: tokenDoc.userId,
                deviceId: tokenDoc.deviceId,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + refreshMaxAge),
            },
        });

        return tokens;
    }

    private async generateTokens(userId: string, deviceId: string | null) {
        const payload = { sub: userId, deviceId };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '1h',
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

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) throw new UnauthorizedException('User not found');

        const profileUpdate: Record<string, string> = {};
        if (dto.firstName !== undefined) profileUpdate.firstName = dto.firstName;
        if (dto.lastName !== undefined) profileUpdate.lastName = dto.lastName;
        if (dto.displayName !== undefined) profileUpdate.displayName = dto.displayName;
        if (dto.avatar !== undefined) profileUpdate.avatar = dto.avatar;

        if (Object.keys(profileUpdate).length === 0) {
            return this.getProfile(userId);
        }

        if (dto.firstName !== undefined || dto.lastName !== undefined) {
            const newFirst = dto.firstName ?? user.profile?.firstName ?? '';
            const newLast = dto.lastName ?? user.profile?.lastName ?? '';
            const combined = `${newFirst} ${newLast}`.trim();
            if (combined) profileUpdate.displayName = combined;
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                profile: user.profile
                    ? { update: profileUpdate }
                    : {
                          create: {
                              firstName: dto.firstName ?? '',
                              lastName: dto.lastName ?? '',
                              displayName: profileUpdate.displayName,
                              avatar: dto.avatar,
                          },
                      },
            },
        });

        return this.getProfile(userId);
    }

    async getProfile(userId: string) {
        // Use Cached Service
        const user = await this.rbacService.getUserWithPermissions(userId);

        if (!user) throw new UnauthorizedException('User not found');

        // Build CASL Ability
        const ability = this.caslAbilityFactory.createForUser(user);

        // Build string permissions (Legacy/Simple)
        const permissions = new Set<string>();
        user.userRoles.forEach(ur => {
            ur.role.permissions.forEach(rp => permissions.add(rp.permission.name));
        });

        user.userPermissions.forEach(up => {
            permissions.add(up.permission.name);
        });

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            profile: user.profile,
            permissions: Array.from(permissions),
            rules: ability.rules, // CASL rules
        };
    }

    getRefreshCookieMaxAge(): number {
        const duration = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
        return this.parseDurationToMs(duration);
    }

    getAccessCookieMaxAge(): number {
        const duration = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h';
        return this.parseDurationToMs(duration);
    }

    private parseDurationToMs(duration: string): number {
        const value = parseInt(duration, 10);
        if (isNaN(value)) return 0;

        const unit = duration.toLowerCase().slice(-1);
        switch (unit) {
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'm':
                return value * 60 * 1000;
            case 's':
                return value * 1000;
            default:
                return value;
        }
    }

    async cleanupExpiredTokens(): Promise<number> {
        return this.authCleanupService.cleanupExpiredTokens();
    }

    async getTokenStatistics() {
        return this.authCleanupService.getTokenStatistics();
    }
}
