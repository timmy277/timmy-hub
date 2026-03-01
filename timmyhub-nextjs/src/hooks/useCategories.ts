import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { QUERY_KEYS } from '@/constants';

export const useCategories = (includeInactive?: boolean) => {
    return useQuery({
        queryKey: QUERY_KEYS.CATEGORIES(includeInactive),
        queryFn: () => categoryService.getCategories(includeInactive),
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.CATEGORY(id),
        queryFn: () => categoryService.getCategoryById(id),
        enabled: !!id,
    });
};
