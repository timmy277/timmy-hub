'use client';

import { Title, Grid, Text, Stack, Loader, Center } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { wishlistService, WishlistItem } from '@/services/wishlist.service';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';
import Iconify from '@/components/iconify/Iconify';
import { QUERY_KEYS } from '@/constants';
import { JSX } from 'react';

export function WishlistPageContent(): JSX.Element {
    const { t } = useTranslation();
    const { data: myWishlist, isLoading, error } = useQuery<WishlistItem[]>({
        queryKey: QUERY_KEYS.MY_WISHLIST,
        queryFn: () => wishlistService.getMyWishlist(),
    });

    if (isLoading) {
        return (
            <Center h={200}>
                <Loader color="orange" />
            </Center>
        );
    }

    if (error || !myWishlist) {
        return (
            <Stack align="center" mt="xl">
                <Text color="red">{t('common.error')}</Text>
            </Stack>
        );
    }

    if (myWishlist.length === 0) {
        return (
            <Stack align="center" justify="center" h={300} gap="sm">
                <Iconify icon="tabler:heart-off" width={48} color="var(--mantine-color-gray-4)" stroke={1.5} />
                <Title order={4} c="dimmed">{t('common.noResults')}</Title>
                <Text size="sm" c="dimmed">
                    {t('profile.myWishlist')}
                </Text>
            </Stack>
        );
    }

    return (
        <Stack gap="lg">
            <Title order={3}>{t('profile.myWishlist')} ({myWishlist.length})</Title>

            <Grid>
                {myWishlist.map((item) => {
                    const productData = {
                        ...item.product,
                        createdAt: item.createdAt,
                        updatedAt: item.createdAt,
                    } as unknown as Product;

                    return (
                        <Grid.Col key={item.id} span={{ base: 12, xs: 6, sm: 4, lg: 3 }}>
                            <ProductCard product={productData} hideAddToCart />
                        </Grid.Col>
                    );
                })}
            </Grid>
        </Stack>
    );
}
