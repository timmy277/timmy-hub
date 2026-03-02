/**
 * Zod schemas cho Payment - CreateVnpayUrl, ValidateVoucher
 */
import { z } from 'zod';
import { PaymentMethodEnum } from './enums';

export const CreateVnpayUrlSchema = z.object({
  orderId: z.string().nonempty('Order ID không được để trống'),
});

export const ValidateVoucherSchema = z.object({
  code: z.string().nonempty('Mã voucher không được để trống'),
  paymentMethod: PaymentMethodEnum.optional(),
});

export type CreateVnpayUrlDto = z.infer<typeof CreateVnpayUrlSchema>;
export type ValidateVoucherDto = z.infer<typeof ValidateVoucherSchema>;
