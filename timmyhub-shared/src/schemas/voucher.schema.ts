/**
 * Zod schema cho Voucher - dùng chung giữa frontend (form validation) và backend (DTO)
 */
import { z } from 'zod';

export const VOUCHER_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'] as const;
export type VoucherType = (typeof VOUCHER_TYPES)[number];

const BaseVoucherSchema = z.object({
  code: z
    .string()
    .min(3, 'Mã voucher phải ít nhất 3 ký tự')
    .max(50, 'Mã voucher quá dài')
    .regex(/^[A-Z0-9_]+$/, 'Mã voucher chỉ chứa chữ hoa, số và dấu _'),
  description: z.string().max(500).optional(),
  type: z.enum(VOUCHER_TYPES),
  value: z.number().min(0, 'Giá trị không được âm'),
  minOrderValue: z.number().min(0, 'Giá trị đơn tối thiểu không được âm').optional(),
  maxDiscount: z.number().min(0, 'Giảm tối đa không được âm').optional(),
  usageLimit: z.number().int().min(1, 'Giới hạn sử dụng phải lớn hơn 0').optional(),
  perUserLimit: z.number().int().min(1, 'Giới hạn mỗi user phải lớn hơn 0').default(1),
  campaignId: z.string().cuid().optional().nullable(),
  sellerId: z.string().cuid().optional().nullable(),
  startDate: z.string().datetime({ message: 'Ngày bắt đầu không hợp lệ' }),
  endDate: z.string().datetime({ message: 'Ngày kết thúc không hợp lệ' }),
  categoryIds: z.array(z.string().cuid()).optional(),
  productIds: z.array(z.string().cuid()).optional(),
  paymentMethods: z.array(z.string()).optional(),
});

export const CreateVoucherSchema = BaseVoucherSchema
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .refine(
    (data) => !(data.type === 'PERCENTAGE' && data.value > 100),
    {
      message: 'Phần trăm giảm không được vượt quá 100%',
      path: ['value'],
    },
  );

// UpdateVoucherSchema dùng base object (không refine) để partial() hoạt động
export const UpdateVoucherSchema = BaseVoucherSchema.partial();

export type CreateVoucherDto = z.infer<typeof CreateVoucherSchema>;
export type UpdateVoucherDto = z.infer<typeof UpdateVoucherSchema>;
