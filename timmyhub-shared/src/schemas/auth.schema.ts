/**
 * Zod schemas cho Auth - Login, Register, UpdateProfile
 */
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ')
    .nonempty('Email không được để trống'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .nonempty('Mật khẩu không được để trống'),
  deviceName: z.string().optional(),
  remember: z.boolean().optional(),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ')
    .nonempty('Email không được để trống'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .nonempty('Mật khẩu không được để trống'),
  firstName: z.string().nonempty('Họ không được để trống'),
  lastName: z.string().nonempty('Tên không được để trống'),
  phone: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  displayName: z.string().max(200).optional(),
  avatar: z.string().url('URL avatar không hợp lệ').optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
