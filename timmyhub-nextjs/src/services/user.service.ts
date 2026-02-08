import axiosClient from '@/libs/axios';
import { User, ApiResponse } from '@/types/auth';

/**
 * Service quản lý người dùng
 * @author TimmyHub AI
 */
export const userService = {
    /**
     * Lấy danh sách tất cả người dùng
     */
    getAllUsers: async (): Promise<ApiResponse<User[]>> => {
        return axiosClient.get('/users');
    },

    /**
     * Lấy chi tiết người dùng
     */
    getUserById: async (id: string): Promise<ApiResponse<User>> => {
        return axiosClient.get(`/users/${id}`);
    },

    /**
     * Kích hoạt/Khóa tài khoản
     */
    toggleUserStatus: async (id: string): Promise<ApiResponse<User>> => {
        return axiosClient.patch(`/users/${id}/toggle-status`);
    },

    /**
     * Gán vai trò cho người dùng
     */
    assignUserRoles: async (id: string, roleNames: string[]): Promise<ApiResponse<void>> => {
        return axiosClient.post(`/users/${id}/roles`, { roleNames });
    },
};
