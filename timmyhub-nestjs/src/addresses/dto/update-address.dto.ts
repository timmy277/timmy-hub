import { createZodDto } from 'nestjs-zod';
import { UpdateAddressSchema } from '@timmyhub/shared';

export class UpdateAddressDto extends createZodDto(UpdateAddressSchema) {}
