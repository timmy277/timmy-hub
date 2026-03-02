import { createZodDto } from 'nestjs-zod';
import { LoginSchema } from '@timmyhub/shared';

export class LoginDto extends createZodDto(LoginSchema) {}
