/**
 * Common schemas tái sử dụng cho pagination, filter, ID params
 */
import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;

export const IdParamSchema = z.object({
  id: z.string().cuid('ID không hợp lệ'),
});

export type IdParam = z.infer<typeof IdParamSchema>;

/** Response wrapper chuẩn */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
