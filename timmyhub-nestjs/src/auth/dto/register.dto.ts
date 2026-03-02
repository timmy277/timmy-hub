import { createZodDto } from 'nestjs-zod';
import { RegisterSchema } from '@timmyhub/shared';

export class RegisterDto extends createZodDto(RegisterSchema) {}
