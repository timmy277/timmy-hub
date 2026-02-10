import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma.service';
import type { UserRequest } from '../../auth/interfaces/auth.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
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

        // 1. Lấy tất cả quyền của User từ Role và trực tiếp
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
        const permissions = new Set<string>();

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
