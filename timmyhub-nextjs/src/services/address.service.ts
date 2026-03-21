import axios from '@/libs/axios';
import type { ApiResponse } from '@/types/api';
import type { Address, CreateAddressDto, UpdateAddressDto } from '@/types/address';

export const addressService = {
    async list(): Promise<ApiResponse<Address[]>> {
        return axios.get('/addresses') as Promise<ApiResponse<Address[]>>;
    },

    async create(dto: CreateAddressDto): Promise<ApiResponse<Address>> {
        return axios.post('/addresses', dto) as Promise<ApiResponse<Address>>;
    },

    async update(id: string, dto: UpdateAddressDto): Promise<ApiResponse<Address>> {
        return axios.patch(`/addresses/${id}`, dto) as Promise<ApiResponse<Address>>;
    },

    async remove(id: string): Promise<ApiResponse<unknown>> {
        return axios.delete(`/addresses/${id}`) as Promise<ApiResponse<unknown>>;
    },

    async setDefault(id: string): Promise<ApiResponse<Address>> {
        return axios.post(`/addresses/${id}/default`) as Promise<ApiResponse<Address>>;
    },
};
