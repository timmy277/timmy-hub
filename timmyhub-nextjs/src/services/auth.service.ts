import axiosClient from '@/libs/axios';
import type { LoginInput, LoginData, User } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
import type { RegisterInput } from '@/hooks/useAuth';

export const authService = {
    login: async (data: LoginInput): Promise<ApiResponse<LoginData>> => {
        return axiosClient.post('/auth/login', data);
    },
    
    register: async (data: RegisterInput): Promise<ApiResponse<User>> => {
        return axiosClient.post('/auth/register', data);
    },
    
    getProfile: async (): Promise<ApiResponse<User>> => {
        return axiosClient.get('/auth/profile');
    },
    
    logout: async (): Promise<ApiResponse<void>> => {
        return axiosClient.delete('/auth/logout');
    },
    
    requestPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
        return axiosClient.post('/auth/forgot-password', { email });
    },
    
    resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
        return axiosClient.post('/auth/reset-password', { token, newPassword });
    },
};
