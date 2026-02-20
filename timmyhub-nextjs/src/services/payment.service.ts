import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type { CreateVnpayUrlDto, CreateVnpayUrlResponse } from '@/types/order';

export const paymentService = {
    async createVnpayUrl(dto: CreateVnpayUrlDto): Promise<ApiResponse<CreateVnpayUrlResponse>> {
        return axios.post('/payments/vnpay/create-url', dto) as Promise<ApiResponse<CreateVnpayUrlResponse>>;
    },
};
