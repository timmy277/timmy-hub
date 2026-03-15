import axiosClient from '@/libs/axios';
import { Product, CreateProductInput, SellerShop, Brand, Seller } from '@/types/product';
import { ApiResponse } from '@/types/api';
import { Category } from '@/types/category';

export interface ProductFilterParams {
    page?: number;
    limit?: number;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sellerId?: string;
    sort?: 'newest' | 'best_selling' | 'price_asc' | 'price_desc' | 'rating';
}

export interface ProductsResponse {
    data: Product[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

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
     * Lấy danh sách sản phẩm với bộ lọc (Public)
     */
    getProductsWithFilters: async (params: ProductFilterParams = {}): Promise<ApiResponse<ProductsResponse>> => {
        return axiosClient.get('/products/filter', { params }) as Promise<ApiResponse<ProductsResponse>>;
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
    createProduct: async (data: Partial<CreateProductInput>): Promise<ApiResponse<Product>> => {
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

    /**
     * Cập nhật sản phẩm (Seller/Admin)
     */
    updateProduct: async (id: string, data: Partial<CreateProductInput>): Promise<ApiResponse<Product>> => {
        return axiosClient.patch(`/products/${id}`, data);
    },

    /**
     * Xóa sản phẩm (Seller - chỉ khi chưa bán)
     */
    deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
        return axiosClient.delete(`/products/${id}`);
    },

    /**
     * Xem gian hàng công khai của seller theo shopSlug (Public)
     */
    getSellerShop: async (shopSlug: string): Promise<ApiResponse<SellerShop>> => {
        return axiosClient.get(`/seller/shop/${shopSlug}`);
    },

    /**
     * Lấy danh sách categories
     */
    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        return axiosClient.get('/categories');
    },

    /**
     * Lấy danh sách brands
     */
    getBrands: async (): Promise<ApiResponse<Brand[]>> => {
        return axiosClient.get('/brands');
    },

    /**
     * Lấy danh sách sellers
     */
    getSellers: async (): Promise<ApiResponse<Seller[]>> => {
        return axiosClient.get('/sellers');
    },
};
