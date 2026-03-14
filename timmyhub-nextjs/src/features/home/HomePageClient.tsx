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
    Button,
    Center,
    Box,
    useComputedColorScheme,
} from '@mantine/core';
import { IconLayoutGrid, IconList, IconLoader2 } from '@tabler/icons-react';
import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Product } from '@/types/product';
import { productService } from '@/services/product.service';

import {
    HeroCarousel,
    CategorySection,
    FlashSaleBanner,
    VoucherSection,
    FeatureSection,
    FooterPromo,
    CampaignSection
} from './components/index-new';

interface HomePageClientProps {
    initialProducts: Product[];
}

const PRODUCTS_PAGE_SIZE = 20;

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export function HomePageClient({ initialProducts }: HomePageClientProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const [showAll, setShowAll] = useState(false);
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

    const displayProducts = showAll
        ? filteredProducts
        : filteredProducts.slice(0, PRODUCTS_PAGE_SIZE);

    const hasMore = filteredProducts.length > PRODUCTS_PAGE_SIZE && !showAll;

    return (
        <Container size="xl" py="lg">
            <Stack gap="xl">
                {/* Hero Section */}
                <HeroCarousel />

                {/* Campaign Banner - Real-time */}
                <CampaignSection />

                {/* Features */}
                <FeatureSection />

                {/* Vouchers */}
                <VoucherSection />

                {/* Categories */}
                <CategorySection />

                {/* Flash Sale */}
                <FlashSaleBanner products={products} />

                {/* Main Products */}
                <m.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <Stack gap="md" id="products-section">
                        <m.div variants={fadeInUp}>
                            <Group justify="space-between" align="center">
                                <Box>
                                    <Group gap="xs" align="center">
                                        <Title order={2} mb={4}>Gợi Ý Hôm Nay</Title>
                                        {isFetching && !isLoading && (
                                            <IconLoader2
                                                size={18}
                                                style={{
                                                    color: 'var(--mantine-color-blue-5)',
                                                    animation: 'spin 1s linear infinite',
                                                }}
                                            />
                                        )}
                                    </Group>
                                    <Text c="dimmed">
                                        {filteredProducts.length > 0
                                            ? `${filteredProducts.length} sản phẩm dành riêng cho bạn`
                                            : 'Những sản phẩm tốt nhất dành riêng cho bạn'}
                                    </Text>
                                </Box>

                                <Group>
                                    <Tabs
                                        value={activeTab}
                                        onChange={(val) => {
                                            setActiveTab(val);
                                            setShowAll(false);
                                        }}
                                        variant="pills"
                                        radius="xl"
                                    >
                                        <Tabs.List>
                                            <Tabs.Tab value="all">Tất cả</Tabs.Tab>
                                            <Tabs.Tab value="new">Mới nhất</Tabs.Tab>
                                            <Tabs.Tab value="best">Bán chạy</Tabs.Tab>
                                            <Tabs.Tab value="sale">Giảm giá</Tabs.Tab>
                                            <Tabs.Tab value="featured">Nổi bật</Tabs.Tab>
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
                                            <IconLayoutGrid size={20} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant={viewMode === 'list' ? 'filled' : 'subtle'}
                                            color="blue"
                                            size="lg"
                                            onClick={() => setViewMode('list')}
                                            radius={0}
                                        >
                                            <IconList size={20} />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Group>
                        </m.div>

                        <m.div variants={fadeInUp}>
                            <ProductGrid
                                products={displayProducts}
                                viewMode={viewMode}
                                isLoading={isLoading}
                            />
                        </m.div>

                        {hasMore && (
                            <m.div variants={fadeInUp}>
                                <Center mt="xl">
                                    <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            radius="xl"
                                            px={40}
                                            onClick={() => setShowAll(true)}
                                        >
                                            Xem Thêm ({filteredProducts.length - PRODUCTS_PAGE_SIZE} sản phẩm)
                                        </Button>
                                    </m.div>
                                </Center>
                            </m.div>
                        )}
                    </Stack>
                </m.div>

                {/* Footer Promo */}
                <FooterPromo />
            </Stack>
        </Container>
    );
}
