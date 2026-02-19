import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type {
    Cart,
    AddToCartDto,
    UpdateCartItemDto,
    BulkAddToCartDto,
    CartValidationResult,
} from '@/types/cart';

export const cartService = {
    async getCart(): Promise<ApiResponse<Cart>> {
        return axios.get('/cart') as Promise<ApiResponse<Cart>>;
    },

    async addToCart(dto: AddToCartDto): Promise<ApiResponse<Cart>> {
        return axios.post('/cart/items', dto) as Promise<ApiResponse<Cart>>;
    },

    async updateQuantity(
        itemId: string,
        dto: UpdateCartItemDto,
    ): Promise<ApiResponse<Cart>> {
        return axios.patch(`/cart/items/${itemId}`, dto) as Promise<ApiResponse<Cart>>;
    },

    async removeItem(itemId: string): Promise<ApiResponse<Cart>> {
        return axios.delete(`/cart/items/${itemId}`) as Promise<ApiResponse<Cart>>;
    },

    async clearCart(): Promise<ApiResponse<{ message: string }>> {
        return axios.delete('/cart') as Promise<ApiResponse<{ message: string }>>;
    },

    async bulkAddToCart(dto: BulkAddToCartDto): Promise<ApiResponse<unknown>> {
        return axios.post('/cart/items/bulk', dto) as Promise<ApiResponse<unknown>>;
    },

    async validateCart(): Promise<ApiResponse<CartValidationResult>> {
        return axios.post('/cart/validate') as Promise<ApiResponse<CartValidationResult>>;
    },
};
