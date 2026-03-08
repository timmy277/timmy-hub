'use client';

import { ActionIcon, Button, ActionIconProps } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService, WishlistItem } from '@/services/wishlist.service';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';

interface WishlistButtonProps extends ActionIconProps {
    productId: string;
    variantType?: 'icon' | 'button';
}

export function WishlistButton({ productId, variantType = 'icon', ...props }: WishlistButtonProps) {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const { data: myWishlist } = useQuery<WishlistItem[]>({
        queryKey: ['my-wishlist'],
        queryFn: () => wishlistService.getMyWishlist(),
        enabled: isAuthenticated,
    });

    const isWishlisted = myWishlist?.some((item) => item.productId === productId);

    const toggleMutation = useMutation({
        mutationFn: () => wishlistService.toggle(productId),
        onMutate: async () => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['my-wishlist'] });
            const previousWishlist = queryClient.getQueryData<WishlistItem[]>(['my-wishlist']);

            queryClient.setQueryData<WishlistItem[]>(['my-wishlist'], (old) => {
                if (!old) return [];
                if (isWishlisted) {
                    return old.filter((item) => item.productId !== productId);
                }
                return [...old, { id: 'temp-id', productId, userId: 'temp', createdAt: new Date().toISOString() } as WishlistItem];
            });

            return { previousWishlist };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['my-wishlist'], context?.previousWishlist);
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể thêm vào mục yêu thích',
                color: 'red',
            });
        },
        onSuccess: (data) => {
            notifications.show({
                title: 'Thành công',
                message: data.message,
                color: data.isWishlisted ? 'red' : 'gray',
                icon: <IconHeart size={16} />,
            });
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
        },
    });

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            notifications.show({
                title: 'Chưa đăng nhập',
                message: 'Vui lòng đăng nhập để sử dụng tính năng yêu thích!',
                color: 'blue',
            });
            return;
        }
        toggleMutation.mutate();
    };

    if (variantType === 'button') {
        return (
            <Button
                variant={isWishlisted ? 'filled' : 'light'}
                color={isWishlisted ? 'red' : 'gray'}
                leftSection={<IconHeart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />}
                onClick={handleToggle}
                loading={toggleMutation.isPending}
            >
                {isWishlisted ? 'Đã Yêu thích' : 'Yêu thích'}
            </Button>
        );
    }

    return (
        <ActionIcon
            variant={isWishlisted ? 'filled' : 'light'}
            color={isWishlisted ? 'red' : 'red'}
            radius="xl"
            size="lg"
            onClick={handleToggle}
            loading={toggleMutation.isPending}
            style={{ zIndex: 1 }}
            {...props}
        >
            <IconHeart size={props.size === 'lg' ? 18 : 16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </ActionIcon>
    );
}
