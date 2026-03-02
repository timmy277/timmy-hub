import { createZodDto } from 'nestjs-zod';
import { CreateVnpayUrlSchema } from '@timmyhub/shared';

export class CreateVnpayUrlDto extends createZodDto(CreateVnpayUrlSchema) {}
