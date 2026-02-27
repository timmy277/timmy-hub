import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import type { UserRequest } from '../../auth/interfaces/auth.interface';
import { RbacService } from '../../rbac/rbac.service';
import { CaslAbilityFactory, UserWithPermissions } from '../../casl/casl-ability.factory';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private rbacService: RbacService,
        private caslAbilityFactory: CaslAbilityFactory,
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

        const userWithPermissions = await this.rbacService.getUserWithPermissions(user.id);

        if (!userWithPermissions) {
            return false;
        }

        // Check against Super Admin or specific 'admin:all' permission
        const userWithRoles = userWithPermissions as { roles: UserRole[] };
        const roles: UserRole[] = Array.isArray(userWithRoles.roles)
            ? userWithRoles.roles.slice()
            : [];
        if (roles.includes(UserRole.SUPER_ADMIN) || this.hasAdminAll(userWithPermissions)) {
            return true;
        }

        // Check if user has ALL required permissions
        const userPermissions = this.extractPermissions(userWithPermissions);
        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.has(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
        }

        return true;
    }

    private hasAdminAll(user: UserWithPermissions): boolean {
        return (
            user.userRoles.some(ur =>
                ur.role.permissions.some(p => p.permission.name === 'admin:all'),
            ) || user.userPermissions.some(up => up.permission.name === 'admin:all')
        );
    }

    private extractPermissions(user: UserWithPermissions): Set<string> {
        const permissions = new Set<string>();
        user.userRoles.forEach(ur => {
            ur.role.permissions.forEach(rp => permissions.add(rp.permission.name));
        });
        user.userPermissions.forEach(up => {
            permissions.add(up.permission.name);
        });
        return permissions;
    }
}
