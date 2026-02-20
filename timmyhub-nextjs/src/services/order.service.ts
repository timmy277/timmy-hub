import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type { Order, CreateOrderFromCartDto, CreateOrderFromCartResponse } from '@/types/order';

export const orderService = {
    async createFromCart(dto: CreateOrderFromCartDto): Promise<ApiResponse<CreateOrderFromCartResponse>> {
        return axios.post('/orders/from-cart', dto) as Promise<ApiResponse<CreateOrderFromCartResponse>>;
    },

    async getOrder(orderId: string): Promise<ApiResponse<Order>> {
        return axios.get(`/orders/${orderId}`) as Promise<ApiResponse<Order>>;
    },
};
