import { createZodDto } from 'nestjs-zod';
import { CreateOrderFromCartSchema } from '@timmyhub/shared';

export class CreateOrderFromCartDto extends createZodDto(CreateOrderFromCartSchema) {}
