/**
 * Zod schemas cho RBAC - CreatePermission, UpdatePermission, CreateRole
 */
import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  name: z.string().nonempty('Tên quyền không được để trống'),
  displayName: z.string().nonempty('Tên hiển thị không được để trống'),
  description: z.string().optional(),
  module: z.string().nonempty('Module không được để trống'),
  action: z.string().nonempty('Action không được để trống'),
});

export const UpdatePermissionSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
});

export const CreateRoleSchema = z.object({
  name: z.string().nonempty('Tên role không được để trống'),
  displayName: z.string().nonempty('Tên hiển thị không được để trống'),
  description: z.string().optional(),
  isSystem: z.boolean().optional().default(false),
  permissionNames: z.array(z.string()).optional(),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionDto = z.infer<typeof UpdatePermissionSchema>;
export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
