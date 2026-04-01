'use client';

import { ActionIcon, Button, ActionIconProps } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService, WishlistItem } from '@/services/wishlist.service';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface WishlistButtonProps extends ActionIconProps {
    productId: string;
    variantType?: 'icon' | 'button';
}

export function WishlistButton({ productId, variantType = 'icon', ...props }: WishlistButtonProps) {
    const { t } = useTranslation('common');
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
                title: t('common.error'),
                message: t('common.somethingWentWrong'),
                color: 'red',
            });
        },
        onSuccess: (data) => {
            notifications.show({
                title: t('common.success'),
                message: data.message,
                color: data.isWishlisted ? 'red' : 'gray',
                icon: <Iconify icon="solar:heart-bold" width={16} />,
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
                title: t('common.error'),
                message: t('common.login'),
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
                leftSection={<Iconify icon="solar:heart-bold" width={16} />}
                onClick={handleToggle}
                loading={toggleMutation.isPending}
            >
                {isWishlisted ? t('common.saved2') : t('profile.myWishlist')}
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
            <Iconify icon={isWishlisted ? "solar:heart-bold" : "solar:heart-outline"} width={props.size === 'lg' ? 18 : 16} />
        </ActionIcon>
    );
}
