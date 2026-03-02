import { createZodDto } from 'nestjs-zod';
import { BulkAddToCartSchema } from '@timmyhub/shared';

export class BulkAddToCartDto extends createZodDto(BulkAddToCartSchema) {}
