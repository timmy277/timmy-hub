import axiosClient from '@/libs/axios';
import { Category, CreateCategoryInput } from '@/types/category';
import { ApiResponse } from '@/types/api';

/**
 * Service quản lý danh mục
 * @author TimmyHub AI
 */
export const categoryService = {
    /**
     * Lấy danh sách danh mục
     */
    getCategories: async (includeInactive = false): Promise<ApiResponse<Category[]>> => {
        return axiosClient.get(`/categories?includeInactive=${includeInactive}`);
    },

    /**
     * Lấy chi tiết danh mục
     */
    getCategory: async (idOrSlug: string): Promise<ApiResponse<Category>> => {
        return axiosClient.get(`/categories/${idOrSlug}`);
    },

    /**
     * Tạo danh mục mới
     */
    createCategory: async (data: CreateCategoryInput): Promise<ApiResponse<Category>> => {
        return axiosClient.post('/categories', data);
    },

    /**
     * Cập nhật danh mục
     */
    updateCategory: async (
        id: string,
        data: Partial<CreateCategoryInput>,
    ): Promise<ApiResponse<Category>> => {
        return axiosClient.patch(`/categories/${id}`, data);
    },

    /**
     * Xóa danh mục
     */
    deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
        return axiosClient.delete(`/categories/${id}`);
    },
};
