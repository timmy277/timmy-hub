import type { Province, District, Ward } from '@/types/location';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const locationService = {
    getProvinces: async (): Promise<Province[]> => {
        const res = await fetch(`${BASE_URL}/locations/provinces`, {
            next: { revalidate: 86400 }, // cache 24h vì location data hiếm khi thay đổi
        });
        if (!res.ok) throw new Error('Failed to fetch provinces');
        return res.json();
    },

    getDistricts: async (provinceCode: string): Promise<District[]> => {
        const res = await fetch(`${BASE_URL}/locations/provinces/${provinceCode}/districts`, {
            next: { revalidate: 86400 },
        });
        if (!res.ok) throw new Error('Failed to fetch districts');
        return res.json();
    },

    getWards: async (districtCode: string): Promise<Ward[]> => {
        const res = await fetch(`${BASE_URL}/locations/districts/${districtCode}/wards`, {
            next: { revalidate: 86400 },
        });
        if (!res.ok) throw new Error('Failed to fetch wards');
        return res.json();
    },
};
