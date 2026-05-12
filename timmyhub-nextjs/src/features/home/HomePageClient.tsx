'use client';

import { useState } from 'react';
import {
    Container,
    Title,
    Stack,
    Group,
    Tabs,
    ActionIcon,
    Box,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery } from '@tanstack/react-query';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Product } from '@/types/product';
import type { Post } from '@/types/post';
import type { Voucher } from '@/services/voucher.service';
import { productService, type ProductFilterParams } from '@/services/product.service';
import { useTranslation } from 'react-i18next';

import {
    HeroCarousel,
    CategorySection,
    FlashSaleBanner,
    VoucherSection,
    FeatureSection,
    FooterPromo,
} from './components/index-new';
import dynamic from 'next/dynamic';

const PostFeedSection = dynamic(
    () => import('@/features/posts/PostFeedSection').then(m => m.PostFeedSection),
    { ssr: false }
);

interface HomePageClientProps {
    initialProducts: Product[];
    initialVouchers: Voucher[];
    initialPosts: Post[];
}

const PRODUCTS_PAGE_SIZE = 10;

export function HomePageClient({ initialProducts, initialVouchers, initialPosts }: HomePageClientProps) {
    const { t } = useTranslation('common');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<string | null>('all');

    // Gọi API với params dựa trên activeTab
    const { data: products = initialProducts, isLoading, isFetching } = useQuery({
        queryKey: ['products', 'home', activeTab],
        queryFn: async () => {
            const params: ProductFilterParams = { limit: PRODUCTS_PAGE_SIZE };

            switch (activeTab) {
                case 'new':
                    params.sort = 'newest';
                    break;
                case 'best':
                    params.sort = 'best_selling';
                    break;
            }

            const res = await productService.getProductsWithFilters(params);
            return res.data.data || [];
        },
        initialData: activeTab === 'all' ? initialProducts.slice(0, PRODUCTS_PAGE_SIZE) : undefined,
        staleTime: 60_000,
    });

    return (
        <Container size="xl" py="xl">
            <Stack gap={48}>
                {/* Hero */}
                <HeroCarousel />

                {/* Features */}
                <FeatureSection />

                {/* Categories */}
                <CategorySection />

                {/* Vouchers */}
                <Box>
                    <Group justify="space-between" mb={24}>
                        <Title order={2} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 32, fontWeight: 700, color: '#1c252e', letterSpacing: '-0.5px' }}>{t('home.voucherForYou')}</Title>
                    </Group>
                    <VoucherSection initialVouchers={initialVouchers} />
                </Box>

                {/* Flash Sale */}
                <FlashSaleBanner />

                {/* Post Feed */}
                <Box>
                    <PostFeedSection initialPosts={initialPosts} />
                </Box>

                {/* Products */}
                <Stack gap={24} id="products-section">
                    <Group justify="space-between" align="center">
                        <Group gap={8} align="center">
                            <Title order={2} style={{ fontFamily: 'Barlow, sans-serif', fontSize: 32, fontWeight: 700, color: '#1c252e', letterSpacing: '-0.5px' }} suppressHydrationWarning>
                                {t('homePage.todaySuggestion')}
                            </Title>
                            {isFetching && !isLoading && (
                                <Iconify icon="solar:refresh-bold" width={20} style={{ color: '#637381', animation: 'spin 1s linear infinite' }} />
                            )}
                        </Group>

                        <Group gap={12}>
                            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius={50} suppressHydrationWarning>
                                <Tabs.List suppressHydrationWarning>
                                    <Tabs.Tab value="all" suppressHydrationWarning><span suppressHydrationWarning>{t('homePage.tabAll')}</span></Tabs.Tab>
                                    <Tabs.Tab value="new" suppressHydrationWarning><span suppressHydrationWarning>{t('homePage.tabNew')}</span></Tabs.Tab>
                                    <Tabs.Tab value="best" suppressHydrationWarning><span suppressHydrationWarning>{t('homePage.tabBest')}</span></Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                            <Group
                                gap={0}
                                style={{
                                    border: '1px solid var(--mantine-color-default-border)',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                }}
                            >
                                <ActionIcon variant={viewMode === 'grid' ? 'filled' : 'subtle'} color="dark" size="lg" onClick={() => setViewMode('grid')} radius={0}>
                                    <Iconify icon="solar:widget-4-bold" width={18} />
                                </ActionIcon>
                                <ActionIcon variant={viewMode === 'list' ? 'filled' : 'subtle'} color="dark" size="lg" onClick={() => setViewMode('list')} radius={0}>
                                    <Iconify icon="solar:list-bold" width={18} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Group>

                    <ProductGrid products={products} viewMode={viewMode} isLoading={isLoading} />
                </Stack>

                {/* Footer Promo */}
                <FooterPromo />
            </Stack>
        </Container>
    );
}
