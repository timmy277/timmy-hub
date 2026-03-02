/**
 * Enums dùng chung - mirror từ Prisma schema
 * Dùng z.enum() để validate input, không import từ @prisma/client trong shared package
 */
import { z } from 'zod';

export const USER_ROLES = ['CUSTOMER', 'SELLER', 'BRAND', 'SHIPPER', 'ADMIN', 'SUPER_ADMIN'] as const;
export const UserRoleEnum = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPING',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUNDED',
] as const;
export const OrderStatusEnum = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const PAYMENT_METHODS = ['COD', 'STRIPE', 'VNPAY', 'WALLET'] as const;
export const PaymentMethodEnum = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const PAYMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;
export const PaymentStatusEnum = z.enum(PAYMENT_STATUSES);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const RESOURCE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'] as const;
export const ResourceStatusEnum = z.enum(RESOURCE_STATUSES);
export type ResourceStatus = z.infer<typeof ResourceStatusEnum>;

export const SHIPPER_STATUSES = ['ONLINE', 'BUSY', 'OFFLINE'] as const;
export const ShipperStatusEnum = z.enum(SHIPPER_STATUSES);
export type ShipperStatus = z.infer<typeof ShipperStatusEnum>;

export const TRANSACTION_TYPES = [
  'DEPOSIT',
  'WITHDRAWAL',
  'PAYMENT',
  'REFUND',
  'SALE_INCOME',
  'COMMISSION',
  'REWARD',
  'FEE',
] as const;
export const TransactionTypeEnum = z.enum(TRANSACTION_TYPES);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;
