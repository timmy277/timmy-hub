import { createZodDto } from 'nestjs-zod';
import { CreateAddressSchema } from '@timmyhub/shared';

export class CreateAddressDto extends createZodDto(CreateAddressSchema) {}
