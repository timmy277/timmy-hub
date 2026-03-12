import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';

export interface Voucher {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount: number;
    perUserLimit: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
    description?: string;
    sellerId?: string;
    campaignId?: string;
    campaign?: {
        id: string;
        name: string;
    };
}

export interface VoucherValidationResult {
    valid: boolean;
    voucherId?: string;
    code?: string;
    discount?: number;
    type?: string;
    message?: string;
    description?: string;
}

export const voucherService = {
    async getAvailableForCart(): Promise<ApiResponse<Voucher[]>> {
        return axios.get('/vouchers/me') as Promise<ApiResponse<Voucher[]>>;
    },

    /**
     * Lấy danh sách voucher public cho trang home
     * Chỉ lấy các voucher: đang hoạt động, còn hạn sử dụng, không thuộc seller cụ thể
     */
    async getPublicVouchers(): Promise<ApiResponse<Voucher[]>> {
        return axios.get('/vouchers/public') as Promise<ApiResponse<Voucher[]>>;
    },

    /**
     * Lấy danh sách voucher theo campaign ID
     */
    async getVouchersByCampaign(campaignId: string): Promise<ApiResponse<Voucher[]>> {
        return axios.get('/vouchers', { params: { campaignId } }) as Promise<ApiResponse<Voucher[]>>;
    },

    async validate(
        code: string,
        paymentMethod?: string,
    ): Promise<ApiResponse<VoucherValidationResult>> {
        return axios.post('/vouchers/validate', { code, paymentMethod }) as Promise<
            ApiResponse<VoucherValidationResult>
        >;
    },

    async getSellerVouchers(): Promise<ApiResponse<Voucher[]>> {
        return axios.get('/vouchers') as Promise<ApiResponse<Voucher[]>>;
    },

    async getAdminVouchers(sellerId?: string): Promise<ApiResponse<Voucher[]>> {
        return axios.get('/vouchers', { params: sellerId ? { sellerId } : {} }) as Promise<ApiResponse<Voucher[]>>;
    },

    async create(data: Partial<Voucher>): Promise<ApiResponse<Voucher>> {
        return axios.post('/vouchers', data) as Promise<ApiResponse<Voucher>>;
    },

    async update(id: string, data: Partial<Voucher>): Promise<ApiResponse<Voucher>> {
        return axios.patch(`/vouchers/${id}`, data) as Promise<ApiResponse<Voucher>>;
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return axios.delete(`/vouchers/${id}`) as Promise<ApiResponse<void>>;
    }
};
