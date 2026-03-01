import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { CreateProductInput } from '@/types/product';
import { notifications } from '@mantine/notifications';
import { QUERY_KEYS } from '@/constants';

export const useProducts = () => {
    return useQuery({
        queryKey: QUERY_KEYS.PRODUCTS,
        queryFn: () => productService.getProducts(),
    });
};

export const useAdminProducts = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ADMIN_PRODUCTS,
        queryFn: () => productService.getAdminProducts(),
    });
};

export const useProduct = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.PRODUCT(id),
        queryFn: () => productService.getProductById(id),
        enabled: !!id,
    });
};

export const useCreateProductMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductInput) => productService.createProduct(data),
        onSuccess: response => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PRODUCTS });
            notifications.show({
                title: 'Thành công',
                message: response.message || 'Đăng sản phẩm thành công',
                color: 'green',
            });
        },
    });
};

export const useApproveProductMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productService.approveProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PRODUCTS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
            notifications.show({
                title: 'Thành công',
                message: 'Đã duyệt sản phẩm',
                color: 'blue',
            });
        },
    });
};

export const useRejectProductMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }: { id: string; note: string }) =>
            productService.rejectProduct(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_PRODUCTS });
            notifications.show({
                title: 'Thành công',
                message: 'Đã từ chối sản phẩm',
                color: 'orange',
            });
        },
    });
};
