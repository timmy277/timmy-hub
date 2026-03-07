import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators';

import { AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    handleRequest<TUser = AuthenticatedUser>(
        err: unknown,
        user: TUser | false,
        info: unknown,
        context: ExecutionContext,
    ): TUser | null {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (err || !user) {
            if (isPublic) {
                return null;
            }
            throw err instanceof Error ? err : new UnauthorizedException('Không có quyền truy cập');
        }
        return user;
    }
}
