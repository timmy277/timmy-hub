import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type {
    DashboardData,
    DashboardOverview,
    RevenueByDay,
    OrderStatusItem,
    TopProduct,
    TopCategory,
    RecentOrder,
    ActivityItem,
} from '@/types/dashboard';

export const dashboardService = {
    async getDashboard(rangeDays = 30): Promise<ApiResponse<DashboardData>> {
        return axios.get('/dashboard', { params: { rangeDays } }) as Promise<ApiResponse<DashboardData>>;
    },

    async getOverview(rangeDays = 30): Promise<ApiResponse<DashboardOverview>> {
        return axios.get('/dashboard/overview', { params: { rangeDays } }) as Promise<ApiResponse<DashboardOverview>>;
    },

    async getRevenueByDay(days = 30): Promise<ApiResponse<RevenueByDay[]>> {
        return axios.get('/dashboard/revenue', { params: { days } }) as Promise<ApiResponse<RevenueByDay[]>>;
    },

    async getOrderStatusBreakdown(): Promise<ApiResponse<OrderStatusItem[]>> {
        return axios.get('/dashboard/orders/status') as Promise<ApiResponse<OrderStatusItem[]>>;
    },

    async getTopProducts(limit = 10): Promise<ApiResponse<TopProduct[]>> {
        return axios.get('/dashboard/products/top', { params: { limit } }) as Promise<ApiResponse<TopProduct[]>>;
    },

    async getTopCategories(limit = 8): Promise<ApiResponse<TopCategory[]>> {
        return axios.get('/dashboard/categories/top', { params: { limit } }) as Promise<ApiResponse<TopCategory[]>>;
    },

    async getRecentOrders(limit = 10): Promise<ApiResponse<RecentOrder[]>> {
        return axios.get('/dashboard/orders/recent', { params: { limit } }) as Promise<ApiResponse<RecentOrder[]>>;
    },

    async getRecentActivity(limit = 15): Promise<ApiResponse<ActivityItem[]>> {
        return axios.get('/dashboard/activity', { params: { limit } }) as Promise<ApiResponse<ActivityItem[]>>;
    },
};
