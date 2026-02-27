import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import type { UserRequest } from '../interfaces/auth.interface';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles?.length) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<UserRequest>();
        if (!user) {
            throw new ForbiddenException('Vui lòng đăng nhập');
        }

        const hasRole = requiredRoles.some(r => user.roles.includes(r));
        if (!hasRole) {
            throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
        }
        return true;
    }
}
