/**
 * Zod schemas cho Seller - RegisterSeller
 */
import { z } from 'zod';

export const RegisterSellerSchema = z.object({
  shopName: z
    .string()
    .min(2, 'Tên gian hàng tối thiểu 2 ký tự')
    .max(100, 'Tên gian hàng tối đa 100 ký tự'),
  shopSlug: z
    .string()
    .min(2, 'Slug tối thiểu 2 ký tự')
    .max(60, 'Slug tối đa 60 ký tự')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
});

export type RegisterSellerDto = z.infer<typeof RegisterSellerSchema>;
