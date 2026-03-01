import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';

export interface Campaign {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    type: string;
    ownerType: 'PLATFORM' | 'SELLER';
    sellerId?: string;
}

export const campaignService = {
    async getSellerCampaigns(): Promise<ApiResponse<Campaign[]>> {
        return axios.get('/promotion-campaigns') as Promise<ApiResponse<Campaign[]>>;
    },

    async getAdminCampaigns(ownerType?: 'PLATFORM' | 'SELLER', ownerId?: string): Promise<ApiResponse<Campaign[]>> {
        const params: Record<string, string> = {};
        if (ownerType) params.ownerType = ownerType;
        if (ownerId) params.ownerId = ownerId;
        return axios.get('/promotion-campaigns', { params }) as Promise<ApiResponse<Campaign[]>>;
    },

    async create(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
        return axios.post('/promotion-campaigns', data) as Promise<ApiResponse<Campaign>>;
    },

    async update(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
        return axios.patch(`/promotion-campaigns/${id}`, data) as Promise<ApiResponse<Campaign>>;
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        return axios.delete(`/promotion-campaigns/${id}`) as Promise<ApiResponse<void>>;
    }
};
