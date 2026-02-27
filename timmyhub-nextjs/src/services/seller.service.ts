import axiosClient from '@/libs/axios';
import type { ApiResponse } from '@/types/api';

export type SellerProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SellerProfile {
    id: string;
    userId: string;
    shopName: string;
    shopSlug: string;
    shopLogo?: string | null;
    description?: string | null;
    status?: SellerProfileStatus;
    isVerified: boolean;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterSellerInput {
    shopName: string;
    shopSlug: string;
    description?: string;
}

export const sellerService = {
    register: async (
        data: RegisterSellerInput,
    ): Promise<ApiResponse<SellerProfile>> => {
        return axiosClient.post('/seller/register', data);
    },

    getProfile: async (): Promise<ApiResponse<SellerProfile>> => {
        return axiosClient.get('/seller/profile');
    },

    checkProfile: async (): Promise<
        ApiResponse<{
            hasSellerProfile: boolean;
            status: SellerProfileStatus | null;
            profile: SellerProfile | null;
        }>
    > => {
        return axiosClient.get('/seller/profile/check');
    },

    /** Admin: danh sách đơn đăng ký seller chờ duyệt */
    listPendingApplications: async (): Promise<
        ApiResponse<Array<SellerProfile & { user: { email: string; profile?: { firstName: string; lastName: string } } }>>
    > => {
        return axiosClient.get('/seller/admin/applications');
    },

    /** Admin: duyệt đơn → user thành SELLER */
    approveApplication: async (profileId: string): Promise<ApiResponse<SellerProfile>> => {
        return axiosClient.patch(`/seller/admin/applications/${profileId}/approve`);
    },

    /** Admin: từ chối đơn */
    rejectApplication: async (profileId: string): Promise<ApiResponse<SellerProfile>> => {
        return axiosClient.patch(`/seller/admin/applications/${profileId}/reject`);
    },
};
