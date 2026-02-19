import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRequest } from '../interfaces/auth.interface';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    return request.user;
});
