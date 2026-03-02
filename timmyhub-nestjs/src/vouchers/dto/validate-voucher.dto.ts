import { createZodDto } from 'nestjs-zod';
import { ValidateVoucherSchema } from '@timmyhub/shared';

export class ValidateVoucherDto extends createZodDto(ValidateVoucherSchema) {}
