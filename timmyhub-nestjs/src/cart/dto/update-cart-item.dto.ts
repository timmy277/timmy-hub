import { createZodDto } from 'nestjs-zod';
import { UpdateCartItemSchema } from '@timmyhub/shared';

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {}
