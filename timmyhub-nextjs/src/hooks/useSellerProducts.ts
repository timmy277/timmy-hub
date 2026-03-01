/**
 * Hooks cho Seller Products - CRUD sản phẩm của gian hàng
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { productService } from '@/services/product.service';
import { CreateProductInput } from '@/types/product';
import { QUERY_KEYS } from '@/constants';

export const useSellerProducts = () => {
    return useQuery({
        queryKey: QUERY_KEYS.SELLER_PRODUCTS,
        queryFn: () => productService.getSellerProducts(),
    });
};

export const useCreateSellerProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductInput) => productService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SELLER_PRODUCTS });
            notifications.show({
                title: 'Đã gửi duyệt',
                message: 'Sản phẩm đang chờ admin phê duyệt.',
                color: 'green',
            });
        },
        onError: (err: unknown) => {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Có lỗi xảy ra';
            notifications.show({ title: 'Lỗi', message: String(msg ?? 'Có lỗi xảy ra'), color: 'red' });
        },
    });
};
