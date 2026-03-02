import { createZodDto } from 'nestjs-zod';
import { CreateRoleSchema, UpdateRoleSchema } from '@timmyhub/shared';

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
