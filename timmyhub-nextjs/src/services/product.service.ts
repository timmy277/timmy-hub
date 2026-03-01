import axiosClient from '@/libs/axios';
import { Product, CreateProductInput } from '@/types/product';
import { ApiResponse } from '@/types/api';

/**
 * Service quản lý sản phẩm
 * @author TimmyHub AI
 */
export const productService = {
    /**
     * Lấy danh sách sản phẩm đã duyệt (Public)
     */
    getProducts: async (): Promise<ApiResponse<Product[]>> => {
        return axiosClient.get('/products');
    },

    /**
     * Seller: lấy sản phẩm của tôi (mọi trạng thái)
     */
    getSellerProducts: async (): Promise<ApiResponse<Product[]>> => {
        return axiosClient.get('/products/seller/mine');
    },

    /**
     * Admin: lấy tất cả sản phẩm (mọi trạng thái)
     */
    getAdminProducts: async (): Promise<ApiResponse<Product[]>> => {
        return axiosClient.get('/products/admin/all');
    },

    /**
     * Admin: lấy sản phẩm chờ duyệt (PENDING)
     */
    getPendingProducts: async (): Promise<ApiResponse<Product[]>> => {
        return axiosClient.get('/products/admin/pending');
    },

    /**
     * Lấy chi tiết sản phẩm
     */
    getProductById: async (id: string): Promise<ApiResponse<Product>> => {
        return axiosClient.get(`/products/${id}`);
    },

    /**
     * Lấy chi tiết sản phẩm qua Slug (Cho SEO)
     */
    getProductBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
        return axiosClient.get(`/products/slug/${slug}`);
    },

    /**
     * Tạo sản phẩm mới
     */
    createProduct: async (data: CreateProductInput): Promise<ApiResponse<Product>> => {
        return axiosClient.post('/products', data);
    },

    /**
     * Duyệt sản phẩm (Admin)
     */
    approveProduct: async (id: string): Promise<ApiResponse<void>> => {
        return axiosClient.patch(`/products/${id}/approve`);
    },

    /**
     * Từ chối sản phẩm (Admin)
     */
    rejectProduct: async (id: string, note: string): Promise<ApiResponse<void>> => {
        return axiosClient.patch(`/products/${id}/reject`, { note });
    },
};
