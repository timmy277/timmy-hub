import { createZodDto } from 'nestjs-zod';
import { RegisterSellerSchema } from '@timmyhub/shared';

export class RegisterSellerDto extends createZodDto(RegisterSellerSchema) {}
