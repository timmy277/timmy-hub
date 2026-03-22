import { useQuery } from '@tanstack/react-query';
import { locationAdminService } from '@/services/location-admin.service';
import { QUERY_KEYS } from '@/constants';

export const useProvinces = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN_PROVINCES,
        queryFn: () => locationAdminService.getProvinces(),
    });
};

export const useDistricts = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN_DISTRICTS,
        queryFn: () => locationAdminService.getDistricts(),
    });
};

export const useWards = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN_WARDS,
        queryFn: () => locationAdminService.getWards(),
    });
};
