/**
 * Zod schemas cho Category - CreateCategory, UpdateCategory
 */
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().nonempty('Tên danh mục không được để trống'),
  slug: z.string().nonempty('Slug không được để trống'),
  parentId: z.string().optional(),
  image: z.string().url('URL hình ảnh không hợp lệ').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
