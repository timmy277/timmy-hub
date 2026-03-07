import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type { Order, CreateOrderFromCartDto, CreateOrderFromCartResponse, OrderStatus } from '@/types/order';

export const orderService = {
    async createFromCart(dto: CreateOrderFromCartDto): Promise<ApiResponse<CreateOrderFromCartResponse>> {
        return axios.post('/orders/from-cart', dto) as Promise<ApiResponse<CreateOrderFromCartResponse>>;
    },

    async getMyOrders(status?: OrderStatus): Promise<ApiResponse<Order[]>> {
        const params = status ? { status } : {};
        return axios.get('/orders', { params }) as Promise<ApiResponse<Order[]>>;
    },

    async getOrder(orderId: string): Promise<ApiResponse<Order>> {
        return axios.get(`/orders/${orderId}`) as Promise<ApiResponse<Order>>;
    },

    async getAdminOrders(status?: OrderStatus): Promise<ApiResponse<Order[]>> {
        const params = status ? { status } : {};
        return axios.get('/orders/admin', { params }) as Promise<ApiResponse<Order[]>>;
    },

    async getAdminOrder(orderId: string): Promise<ApiResponse<Order>> {
        return axios.get(`/orders/admin/${orderId}`) as Promise<ApiResponse<Order>>;
    },

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> {
        return axios.patch(`/orders/admin/${orderId}/status`, { status }) as Promise<ApiResponse<Order>>;
    },

    /** Người mua xác nhận đã nhận hàng → COMPLETED */
    async confirmReceived(orderId: string): Promise<ApiResponse<Order>> {
        return axios.patch(`/orders/${orderId}/confirm-received`) as Promise<ApiResponse<Order>>;
    },
};
