'use client';

/**
 * HomePageClient - Client component chính của trang chủ
 * Dùng useQuery với initialData từ SSR để đảm bảo sản phẩm luôn cập nhật
 */

import { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Stack,
    Group,
    Tabs,
    ActionIcon,
    Box,
    useComputedColorScheme,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery } from '@tanstack/react-query';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Product } from '@/types/product';
import { productService } from '@/services/product.service';
import { useTranslation } from 'react-i18next';

import {
    HeroCarousel,
    CategorySection,
    FlashSaleBanner,
    VoucherSection,
    FeatureSection,
    FooterPromo,
} from './components/index-new';

interface HomePageClientProps {
    initialProducts: Product[];
}

const PRODUCTS_PAGE_SIZE = 8;

export function HomePageClient({ initialProducts }: HomePageClientProps) {
    const { t } = useTranslation('common');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    // Dùng useQuery với initialData từ SSR: sản phẩm hiển thị ngay, tự refresh sau staleTime
    const { data: products = initialProducts, isLoading, isFetching } = useQuery({
        queryKey: ['products', 'approved'],
        queryFn: async () => {
            const res = await productService.getProducts();
            return res.data;
        },
        initialData: initialProducts,
        staleTime: 60_000,
    });

    // Lọc theo tab đang chọn
    const filteredProducts = (() => {
        switch (activeTab) {
            case 'new':
                return products.filter(p => p.isNew);
            case 'sale':
                return products.filter(p => p.originalPrice != null && p.originalPrice > p.price);
            case 'best':
                return [...products].sort((a, b) => b.soldCount - a.soldCount);
            case 'featured':
                return products.filter(p => p.isFeatured);
            default:
                return products;
        }
    })();

    const displayProducts = filteredProducts.slice(0, PRODUCTS_PAGE_SIZE);

    return (
        <Container size="xl" py="lg">
            <Stack gap="xl">
                {/* Hero Section */}
                <HeroCarousel />

                {/* Features */}
                <FeatureSection />

                {/* Vouchers */}
                <VoucherSection />

                {/* Categories */}
                <CategorySection />

                {/* Flash Sale */}
                <FlashSaleBanner />

                {/* Main Products */}
                <Stack gap="md" id="products-section">
                    <Group justify="space-between" align="center">
                        <Box>
                            <Group gap="xs" align="center">
                                <Title order={2} mb={4} suppressHydrationWarning>{t('homePage.todaySuggestion')}</Title>
                                {isFetching && !isLoading && (
                                    <Iconify
                                        icon="tabler:loader-2"
                                        width={18}
                                        style={{
                                            color: 'var(--mantine-color-blue-5)',
                                            animation: 'spin 1s linear infinite',
                                        }}
                                    />
                                )}
                            </Group>
                            <Text c="dimmed">
                                {filteredProducts.length > 0
                                    ? t('homePage.productsForYou', { count: filteredProducts.length })
                                    : t('homePage.bestForYou')}
                            </Text>
                        </Box>

                        <Group>
                            <Tabs
                                value={activeTab}
                                onChange={(val) => {
                                    setActiveTab(val);
                                }}
                                variant="pills"
                                radius="xl"
                            >
                                <Tabs.List>
                                    <Tabs.Tab value="all">{t('homePage.tabAll')}</Tabs.Tab>
                                    <Tabs.Tab value="new">{t('homePage.tabNew')}</Tabs.Tab>
                                    <Tabs.Tab value="best">{t('homePage.tabBest')}</Tabs.Tab>
                                    <Tabs.Tab value="sale">{t('homePage.tabSale')}</Tabs.Tab>
                                    <Tabs.Tab value="featured">{t('homePage.tabFeatured')}</Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                            <Group
                                gap={0}
                                style={{
                                    border: isDark
                                        ? '1px solid var(--mantine-color-dark-4)'
                                        : '1px solid #eee',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                }}
                            >
                                <ActionIcon
                                    variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                                    color="blue"
                                    size="lg"
                                    onClick={() => setViewMode('grid')}
                                    radius={0}
                                >
                                    <Iconify icon="tabler:layout-grid" width={20} />
                                </ActionIcon>
                                <ActionIcon
                                    variant={viewMode === 'list' ? 'filled' : 'subtle'}
                                    color="blue"
                                    size="lg"
                                    onClick={() => setViewMode('list')}
                                    radius={0}
                                >
                                    <Iconify icon="tabler:list" width={20} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Group>

                    <ProductGrid
                        products={displayProducts}
                        viewMode={viewMode}
                        isLoading={isLoading}
                    />
                </Stack>

                {/* Footer Promo */}
                <FooterPromo />
            </Stack>
        </Container>
    );
}
