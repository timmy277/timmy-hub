import axiosClient from "@/libs/axios";
import type { LoginInput, LoginData, ApiResponse, User } from "@/types/auth";

export const authService = {
    login: async (data: LoginInput): Promise<ApiResponse<LoginData>> => {
        return axiosClient.post('/auth/login', data);
    },
    getProfile: async (): Promise<ApiResponse<User>> => {
        return axiosClient.get('/auth/profile');
    },
    logout: async (): Promise<ApiResponse<void>> => {
        return axiosClient.delete('/auth/logout');
    }
};
