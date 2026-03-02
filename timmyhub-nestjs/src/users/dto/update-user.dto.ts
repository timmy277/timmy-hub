import { createZodDto } from 'nestjs-zod';
import { UpdateUserSchema } from '@timmyhub/shared';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
