/**
 * @timmyhub/shared
 * Single source of truth cho validation schemas & TypeScript types
 * dùng chung giữa timmyhub-nestjs và timmyhub-nextjs
 */

// Enums
export * from './schemas/enums';

// Domain schemas
export * from './schemas/auth.schema';
export * from './schemas/user.schema';
export * from './schemas/cart.schema';
export * from './schemas/category.schema';
export * from './schemas/order.schema';
export * from './schemas/payment.schema';
export * from './schemas/product.schema';
export * from './schemas/rbac.schema';
export * from './schemas/seller.schema';
export * from './schemas/voucher.schema';
export * from './schemas/campaign.schema';
export * from './schemas/address.schema';

// Common utilities
export * from './schemas/common.schema';
