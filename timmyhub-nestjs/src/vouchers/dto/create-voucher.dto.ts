import { createZodDto } from 'nestjs-zod';
import { CreateVoucherSchema } from '@timmyhub/shared';

export class CreateVoucherDto extends createZodDto(CreateVoucherSchema) {}
