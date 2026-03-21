/**
 * Zod schemas cho Order - CreateOrderFromCart, UpdateOrderStatus
 */
import { z } from 'zod';
import { PaymentMethodEnum, OrderStatusEnum } from './enums';

export const CreateOrderFromCartSchema = z.object({
  paymentMethod: PaymentMethodEnum.default('VNPAY').optional(),
  voucherCode: z.string().optional(),
  addressId: z.string().cuid(),
  customerNote: z.string().max(2000).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
});

export type CreateOrderFromCartDto = z.infer<typeof CreateOrderFromCartSchema>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
