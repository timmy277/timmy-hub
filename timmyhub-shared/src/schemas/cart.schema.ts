/**
 * Zod schemas cho Cart - AddToCart, BulkAddToCart, UpdateCartItem
 */
import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z.string().nonempty('productId không được để trống'),
  quantity: z
    .number()
    .int()
    .min(1, 'Số lượng phải lớn hơn 0')
    .max(99, 'Số lượng tối đa là 99'),
});

export const BulkAddToCartSchema = z.object({
  items: z
    .array(AddToCartSchema)
    .min(1, 'Cần ít nhất 1 sản phẩm')
    .max(20, 'Tối đa 20 sản phẩm một lần'),
});

export const UpdateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, 'Số lượng phải >= 0 (0 để xóa)')
    .max(99, 'Số lượng tối đa là 99'),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type BulkAddToCartDto = z.infer<typeof BulkAddToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
