'use client';

/**
 * Thanh sắp xếp + lưới sản phẩm + phân trang "Xem thêm".
 */
import { useMemo, type ReactElement } from 'react';
import { Box, Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types/product';
import { ProductCard } from '@/features/products/components/ProductCard';
import type { SellerShopSortMode } from '@/constants/seller-shop-ui';

interface SellerShopProductBlockProps {
    products: Product[];
    sortMode: SellerShopSortMode;
    onSortModeChange: (mode: SellerShopSortMode) => void;
    visibleCount: number;
    onLoadMore: () => void;
}

export function SellerShopProductBlock({
    products,
    sortMode,
    onSortModeChange,
    visibleCount,
    onLoadMore,
}: SellerShopProductBlockProps): ReactElement {
    const { t } = useTranslation('common');

    const visible = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
    const hasMore = visibleCount < products.length;
    const from = products.length === 0 ? 0 : 1;
    const to = Math.min(visibleCount, products.length);

    const handlePriceClick = (): void => {
        if (sortMode === 'priceAsc') {
            onSortModeChange('priceDesc');
            return;
        }
        if (sortMode === 'priceDesc') {
            onSortModeChange('priceAsc');
            return;
        }
        onSortModeChange('priceAsc');
    };

    const isPriceActive = sortMode === 'priceAsc' || sortMode === 'priceDesc';

    return (
        <Stack suppressHydrationWarning gap="lg">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Group gap="xs" wrap="wrap">
                    <Text size="sm" fw={600} c="dimmed">
                        {t('sellerShop.sortLabel')}
                    </Text>
                    <Button
                        size="compact-sm"
                        variant={sortMode === 'popular' ? 'filled' : 'light'}
                        color="blue"
                        onClick={() => onSortModeChange('popular')}
                    >
                        {t('sellerShop.sortPopular')}
                    </Button>
                    <Button
                        size="compact-sm"
                        variant={sortMode === 'newest' ? 'filled' : 'light'}
                        color="blue"
                        onClick={() => onSortModeChange('newest')}
                    >
                        {t('sellerShop.sortNewest')}
                    </Button>
                    <Button
                        size="compact-sm"
                        variant={sortMode === 'bestSelling' ? 'filled' : 'light'}
                        color="blue"
                        onClick={() => onSortModeChange('bestSelling')}
                    >
                        {t('sellerShop.sortBestSelling')}
                    </Button>
                    <Button
                        size="compact-sm"
                        variant={isPriceActive ? 'filled' : 'light'}
                        color="blue"
                        onClick={handlePriceClick}
                        rightSection={
                            isPriceActive ? (
                                <Iconify
                                    icon={sortMode === 'priceDesc' ? 'tabler:arrow-down' : 'tabler:arrow-up'}
                                    width={14}
                                />
                            ) : null
                        }
                    >
                        {t('sellerShop.sortPrice')}
                    </Button>
                </Group>
                {products.length > 0 && (
                    <Text size="sm" c="dimmed" ta="right" className="max-w-full">
                        {t('sellerShop.pagination', { from, to, total: products.length })}
                    </Text>
                )}
            </Group>

            {products.length === 0 ? (
                <Box py="xl" ta="center">
                    <Text c="dimmed">{t('sellerShop.emptyProducts')}</Text>
                </Box>
            ) : (
                <>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing="md">
                        {visible.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </SimpleGrid>
                    {hasMore && (
                        <Button variant="default" fullWidth radius="md" size="md" onClick={onLoadMore}>
                            {t('sellerShop.loadMore')}
                        </Button>
                    )}
                </>
            )}
        </Stack>
    );
}
