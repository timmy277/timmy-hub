import type { Province, District, Ward } from '@/types/location';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const locationAdminService = {
    getProvinces: async (): Promise<Province[]> => {
        const res = await fetch(`${BASE_URL}/v1/locations/provinces/admin`);
        if (!res.ok) throw new Error('Failed to fetch provinces');
        return res.json();
    },

    getDistricts: async (): Promise<District[]> => {
        const res = await fetch(`${BASE_URL}/v1/locations/districts/admin`);
        if (!res.ok) throw new Error('Failed to fetch districts');
        return res.json();
    },

    getWards: async (): Promise<Ward[]> => {
        const res = await fetch(`${BASE_URL}/v1/locations/wards/admin`);
        if (!res.ok) throw new Error('Failed to fetch wards');
        return res.json();
    },

    getProvincesPublic: async (): Promise<Province[]> => {
        const res = await fetch(`${BASE_URL}/v1/locations/provinces`);
        if (!res.ok) throw new Error('Failed to fetch provinces');
        return res.json();
    },

    getDistrictsByProvince: async (provinceCode: string): Promise<District[]> => {
        const res = await fetch(
            `${BASE_URL}/v1/locations/provinces/${provinceCode}/districts`,
        );
        if (!res.ok) throw new Error('Failed to fetch districts');
        return res.json();
    },

    getWardsByDistrict: async (districtCode: string): Promise<Ward[]> => {
        const res = await fetch(`${BASE_URL}/v1/locations/districts/${districtCode}/wards`);
        if (!res.ok) throw new Error('Failed to fetch wards');
        return res.json();
    },
};
