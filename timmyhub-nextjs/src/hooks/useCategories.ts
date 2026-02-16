import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

export const useCategories = (includeInactive?: boolean) => {
    return useQuery({
        queryKey: ['categories', includeInactive],
        queryFn: () => categoryService.getCategories(includeInactive),
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: ['category', id],
        queryFn: () => categoryService.getCategoryById(id),
        enabled: !!id,
    });
};
