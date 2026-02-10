import axiosInstance from '@/libs/axios';
import { ApiResponse } from '@/types/api';
import {
    Role,
    Permission,
    CreateRoleInput,
    CreatePermissionInput,
    UpdatePermissionInput,
} from '@/types/rbac';

class RbacService {
    // Roles
    async getAllRoles(): Promise<ApiResponse<Role[]>> {
        return axiosInstance.get('/rbac/roles');
    }

    async getRoleById(id: string): Promise<ApiResponse<Role>> {
        return axiosInstance.get(`/rbac/roles/${id}`);
    }

    async createRole(data: CreateRoleInput): Promise<ApiResponse<Role>> {
        return axiosInstance.post('/rbac/roles', data);
    }

    async deleteRole(id: string): Promise<ApiResponse<void>> {
        return axiosInstance.delete(`/rbac/roles/${id}`);
    }

    async assignPermissionsToRole(
        roleId: string,
        permissionNames: string[],
    ): Promise<ApiResponse<void>> {
        return axiosInstance.put(`/rbac/roles/${roleId}/permissions`, {
            permissionNames,
        });
    }

    // Permissions
    async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
        return axiosInstance.get('/rbac/permissions');
    }

    async getPermissionById(id: string): Promise<ApiResponse<Permission>> {
        return axiosInstance.get(`/rbac/permissions/${id}`);
    }

    async createPermission(data: CreatePermissionInput): Promise<ApiResponse<Permission>> {
        return axiosInstance.post('/rbac/permissions', data);
    }

    async updatePermission(
        id: string,
        data: UpdatePermissionInput,
    ): Promise<ApiResponse<Permission>> {
        return axiosInstance.put(`/rbac/permissions/${id}`, data);
    }

    async deletePermission(id: string): Promise<ApiResponse<void>> {
        return axiosInstance.delete(`/rbac/permissions/${id}`);
    }
}

export const rbacService = new RbacService();
