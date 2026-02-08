import axiosClient from '@/libs/axios';
import { User } from '@/types/auth';
import { ApiResponse } from '@/types/api';
import { CreateUserInput } from '@/types/user';

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

    /**
     * Cập nhật thông tin người dùng
     */
    updateUser: async (id: string, data: Partial<CreateUserInput>): Promise<ApiResponse<User>> => {
        return axiosClient.patch(`/users/${id}`, data);
    },

    /**
     * Tạo người dùng mới
     */
    createUser: async (data: CreateUserInput): Promise<ApiResponse<User>> => {
        return axiosClient.post('/users', data);
    },
};
