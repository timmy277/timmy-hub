import { createZodDto } from 'nestjs-zod';
import { CreateCategorySchema, UpdateCategorySchema } from '@timmyhub/shared';

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
