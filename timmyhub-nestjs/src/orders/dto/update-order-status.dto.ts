import { createZodDto } from 'nestjs-zod';
import { UpdateOrderStatusSchema } from '@timmyhub/shared';

export class UpdateOrderStatusDto extends createZodDto(UpdateOrderStatusSchema) {}
