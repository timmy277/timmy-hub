import { createZodDto } from 'nestjs-zod';
import { CreatePermissionSchema, UpdatePermissionSchema } from '@timmyhub/shared';

export class CreatePermissionDto extends createZodDto(CreatePermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(UpdatePermissionSchema) {}
