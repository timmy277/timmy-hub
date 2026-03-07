/** Review API service */
import axiosClient from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type { ReviewListResponse, CreateReviewInput, Review } from '@/types/review';

export const reviewService = {
    create: async (data: CreateReviewInput): Promise<ApiResponse<Review>> => {
        return axiosClient.post('/reviews', data);
    },

    getByProduct: async (
        productId: string,
        params?: {
            page?: number;
            limit?: number;
            rating?: number;
            sort?: string;
        },
    ): Promise<ApiResponse<ReviewListResponse>> => {
        return axiosClient.get(`/reviews/product/${productId}`, { params });
    },

    toggleHelpful: async (reviewId: string): Promise<ApiResponse<{ helpfulCount: number; voted: boolean }>> => {
        return axiosClient.patch(`/reviews/${reviewId}/helpful`);
    },

    canReview: async (orderItemId: string): Promise<ApiResponse<{ canReview: boolean; reason?: string }>> => {
        return axiosClient.get('/reviews/can-review', { params: { orderItemId } });
    },
};
