/**
 * Zod schemas cho User - CreateUser, UpdateUser
 */
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ')
    .nonempty('Email không được để trống'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  firstName: z.string().nonempty('Họ không được để trống'),
  lastName: z.string().nonempty('Tên không được để trống'),
  role: z.string().optional(),
  phoneNumber: z.string().optional(),
  roleNames: z.array(z.string()).optional(),
  avatar: z.string().url('URL avatar không hợp lệ').optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  isActive: z.boolean().optional(),
  phoneNumber: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
