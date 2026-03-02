import { createZodDto } from 'nestjs-zod';
import { AddToCartSchema } from '@timmyhub/shared';

export class AddToCartDto extends createZodDto(AddToCartSchema) {}
