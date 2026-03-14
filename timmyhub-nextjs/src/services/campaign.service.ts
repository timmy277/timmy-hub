import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';

export interface CampaignProduct {
    id: string;
    campaignId: string;
    productId: string;
    campaignPrice?: number;
    discountPercent?: number;
    maxQuantity?: number;
    soldQuantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
        price: number;
        originalPrice?: number;
        stock: number;
        soldCount: number;
        ratingAvg: number;
        ratingCount: number;
    };
}

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
    // UI fields
    banner?: string;
    icon?: string;
    backgroundColor?: string;
    titleColor?: string;
    badgeText?: string;
    // Relations
    vouchers?: CampaignVoucher[];
    campaignProducts?: CampaignProduct[];
}

export interface CampaignVoucher {
    id: string;
    code: string;
    type: string;
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
}

export interface ProductCampaignPrice {
    campaignId: string;
    campaignName: string;
    campaignType: string;
    campaignPrice?: number;
    discountPercent?: number;
    maxQuantity?: number;
}

export const campaignService = {
    /**
     * Lấy danh sách campaigns đang hoạt động (public - dùng cho homepage)
     */
    async getActiveCampaigns(): Promise<ApiResponse<Campaign[]>> {
        return axios.get('/promotion-campaigns/active') as Promise<ApiResponse<Campaign[]>>;
    },

    /**
     * Lấy chi tiết campaign đang hoạt động
     */
    async getActiveCampaign(id: string): Promise<ApiResponse<Campaign>> {
        return axios.get(`/promotion-campaigns/active/${id}`) as Promise<ApiResponse<Campaign>>;
    },

    /**
     * Lấy sản phẩm trong campaign
     */
    async getCampaignProducts(campaignId: string): Promise<ApiResponse<CampaignProduct[]>> {
        return axios.get(`/promotion-campaigns/${campaignId}/products`) as Promise<ApiResponse<CampaignProduct[]>>;
    },

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
    },

    /**
     * Thêm sản phẩm vào campaign (áp dụng chung cho tất cả)
     */
    async addProducts(campaignId: string, data: {
        productIds: string[];
        campaignPrice?: number;
        discountPercent?: number;
        maxQuantity?: number;
    }): Promise<ApiResponse<void>> {
        return axios.post(`/promotion-campaigns/${campaignId}/products`, data) as Promise<ApiResponse<void>>;
    },

    /**
     * Thêm sản phẩm vào campaign (với giá riêng cho từng sản phẩm)
     */
    async addProductsWithPrices(campaignId: string, products: {
        productId: string;
        campaignPrice?: number;
        discountPercent?: number;
        maxQuantity?: number;
    }[]): Promise<ApiResponse<void>> {
        return axios.post(`/promotion-campaigns/${campaignId}/products/bulk`, { products }) as Promise<ApiResponse<void>>;
    },

    /**
     * Cập nhật giá sản phẩm trong campaign
     */
    async updateProductPrice(campaignId: string, productId: string, data: {
        campaignPrice?: number;
        discountPercent?: number;
        maxQuantity?: number;
    }): Promise<ApiResponse<void>> {
        return axios.patch(`/promotion-campaigns/${campaignId}/products/${productId}`, data) as Promise<ApiResponse<void>>;
    },

    /**
     * Xóa sản phẩm khỏi campaign
     */
    async removeProducts(campaignId: string, productIds: string[]): Promise<ApiResponse<void>> {
        return axios.delete(`/promotion-campaigns/${campaignId}/products?productIds=${productIds.join(',')}`) as Promise<ApiResponse<void>>;
    },

    /**
     * Lấy giá campaign của sản phẩm
     */
    async getProductCampaignPrice(productId: string): Promise<ApiResponse<ProductCampaignPrice | null>> {
        return axios.get(`/promotion-campaigns/product/${productId}/price`);
    }
};
