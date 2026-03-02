import { createZodDto } from 'nestjs-zod';
import { UpdateVoucherSchema } from '@timmyhub/shared';

export class UpdateVoucherDto extends createZodDto(UpdateVoucherSchema) {}
