import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '@timmyhub/shared';

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
