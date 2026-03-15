/**
 * Zod schemas cho Product - CreateProduct, UpdateProduct
 */
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().nonempty('Tên sản phẩm không được để trống'),
  slug: z.string().nonempty('Slug không được để trống'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá bán không được âm'),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'Tồn kho không được âm'),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string().url('URL hình ảnh không hợp lệ')).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
