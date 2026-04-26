'use client';

import { useState, useMemo } from 'react';
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
import dynamic from 'next/dynamic';

const PostFeedSection = dynamic(
    () => import('@/features/posts/PostFeedSection').then(m => m.PostFeedSection),
    { ssr: false }
);

interface HomePageClientProps {
    initialProducts: Product[];
}

const PRODUCTS_PAGE_SIZE = 10;

export function HomePageClient({ initialProducts }: HomePageClientProps) {
    const { t } = useTranslation('common');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<string | null>('all');

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

    const filteredProducts = useMemo(() => {
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
    }, [products, activeTab]);

    const displayProducts = useMemo(
        () => filteredProducts.slice(0, PRODUCTS_PAGE_SIZE),
        [filteredProducts]
    );

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
                    <Group justify="space-between" mb={20}>
                        <Title order={3} style={{ fontSize: 20, fontWeight: 700, color: '#1c252e' }}>Voucher dành cho bạn</Title>
                    </Group>
                    <VoucherSection />
                </Box>

                {/* Flash Sale */}
                <FlashSaleBanner />

                {/* Post Feed */}
                <Box>
                    <PostFeedSection />
                </Box>

                {/* Products */}
                <Stack gap={20} id="products-section">
                    <Group justify="space-between" align="center">
                        <Group gap={8} align="center">
                            <Title order={3} style={{ fontSize: 20, fontWeight: 700, color: '#1c252e' }} suppressHydrationWarning>
                                {t('homePage.todaySuggestion')}
                            </Title>
                            {isFetching && !isLoading && (
                                <Iconify icon="solar:refresh-bold" width={16} style={{ color: '#637381', animation: 'spin 1s linear infinite' }} />
                            )}
                        </Group>

                        <Group gap={12}>
                            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius={50}>
                                <Tabs.List suppressHydrationWarning>
                                    <Tabs.Tab value="all"><span suppressHydrationWarning>{t('homePage.tabAll')}</span></Tabs.Tab>
                                    <Tabs.Tab value="new"><span suppressHydrationWarning>{t('homePage.tabNew')}</span></Tabs.Tab>
                                    <Tabs.Tab value="best"><span suppressHydrationWarning>{t('homePage.tabBest')}</span></Tabs.Tab>
                                    <Tabs.Tab value="sale"><span suppressHydrationWarning>{t('homePage.tabSale')}</span></Tabs.Tab>
                                    <Tabs.Tab value="featured"><span suppressHydrationWarning>{t('homePage.tabFeatured')}</span></Tabs.Tab>
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

                    <ProductGrid products={displayProducts} viewMode={viewMode} isLoading={isLoading} />
                </Stack>

                {/* Footer Promo */}
                <FooterPromo />
            </Stack>
        </Container>
    );
}
