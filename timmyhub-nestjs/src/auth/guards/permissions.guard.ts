import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import type { UserRequest } from '../../auth/interfaces/auth.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<UserRequest>();

        if (!user) {
            return false;
        }

        const cacheKey = `user_permissions:${user.id}`;
        let permissions: Set<string>;

        // 1. Kiểm tra Cache trước
        const cachedPermissions = await this.cacheManager.get<string[]>(cacheKey);

        if (cachedPermissions) {
            permissions = new Set(cachedPermissions);
        } else {
            // 2. Nếu không có cache, lấy từ Database
            const userWithPermissions = await this.prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    userPermissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });

            if (!userWithPermissions) {
                return false;
            }

            // Gộp tất cả permissions
            permissions = new Set<string>();

            // Từ Roles
            userWithPermissions.userRoles.forEach(ur => {
                ur.role.permissions.forEach(rp => {
                    permissions.add(rp.permission.name);
                });
            });

            // Từ UserPermissions trực tiếp
            userWithPermissions.userPermissions.forEach(up => {
                permissions.add(up.permission.name);
            });

            // Lưu vào Cache (10 phút)
            await this.cacheManager.set(cacheKey, Array.from(permissions), 600000);
        }

        // Đặc cách cho SUPER_ADMIN hoặc người có quyền admin:all
        if (user.role === 'SUPER_ADMIN' || permissions.has('admin:all')) {
            return true;
        }

        // Kiểm tra xem User có đủ TẤT CẢ các quyền yêu cầu không
        const hasPermission = requiredPermissions.every(permission => permissions.has(permission));

        if (!hasPermission) {
            throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
        }

        return true;
    }
}
