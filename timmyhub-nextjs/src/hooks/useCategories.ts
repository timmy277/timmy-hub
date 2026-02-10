import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { CreateCategoryInput } from '@/types/category';
import { notifications } from '@mantine/notifications';

export const useCategories = (includeInactive = false) => {
    return useQuery({
        queryKey: ['categories', includeInactive],
        queryFn: () => categoryService.getCategories(includeInactive),
    });
};

export const useCategory = (idOrSlug: string) => {
    return useQuery({
        queryKey: ['category', idOrSlug],
        queryFn: () => categoryService.getCategory(idOrSlug),
        enabled: !!idOrSlug,
    });
};

export const useCreateCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoryInput) => categoryService.createCategory(data),
        onSuccess: response => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            notifications.show({
                title: 'Thành công',
                message: response.message || 'Tạo danh mục thành công',
                color: 'green',
            });
        },
    });
};

export const useUpdateCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryInput> }) =>
            categoryService.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật danh mục thành công',
                color: 'blue',
            });
        },
    });
};

export const useDeleteCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            notifications.show({
                title: 'Thành công',
                message: 'Xóa danh mục thành công',
                color: 'red',
            });
        },
    });
};
