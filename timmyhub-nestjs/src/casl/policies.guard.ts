import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_POLICIES_KEY } from './check-policies.decorator';
import { PolicyHandler } from './policy.handler';
import { RbacService } from '../rbac/rbac.service';
import { UserRequest } from '../auth/interfaces/auth.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
        private rbacService: RbacService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const policyHandlers =
            this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

        const { user } = context.switchToHttp().getRequest<UserRequest>();

        if (!user) {
            return false;
        }

        const userWithPermissions = await this.rbacService.getUserWithPermissions(user.id);

        if (!userWithPermissions) {
            return false;
        }

        // We need to fetch the full user details to build ability
        // Or integrate the fetching inside CaslAbilityFactory but that couples it to DB.
        // Doing it here or in RbacService is better.

        const ability = this.caslAbilityFactory.createForUser(userWithPermissions);

        const results = policyHandlers.every(handler => this.execPolicyHandler(handler, ability));

        if (!results) {
            throw new ForbiddenException(
                'Bạn không có quyền thực hiện hành động này (Policy Check Failed)',
            );
        }

        return true;
    }

    private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
        if (typeof handler === 'function') {
            return handler(ability);
        }
        return handler.handle(ability);
    }
}
