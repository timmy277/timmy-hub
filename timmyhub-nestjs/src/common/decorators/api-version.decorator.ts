import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'apiVersion';

/**
 * Decorator to set API version for controllers
 * @example
 * @ApiVersion('1')
 * @Controller('users')
 * export class UsersControllerV1 {}
 */
export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);
