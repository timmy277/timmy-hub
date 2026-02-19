'use client';

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
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Product } from '@/types/product';

import {
    HeroCarousel,
    CategorySection,
    FlashSaleBanner,
    VoucherSection,
    FeatureSection,
    FooterPromo
} from './components/index-new';

interface HomePageClientProps {
    initialProducts: Product[];
}

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
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

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
                    <FlashSaleBanner products={initialProducts} />

                    {/* Main Products */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <Stack gap="md" id="products-section">
                            <motion.div variants={fadeInUp}>
                                <Group justify="space-between" align="center">
                                    <Box>
                                        <Title order={2} mb={4}>Gợi Ý Hôm Nay</Title>
                                        <Text c="dimmed">Những sản phẩm tốt nhất dành riêng cho bạn</Text>
                                    </Box>

                                    <Group>
                                        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="xl">
                                            <Tabs.List>
                                                <Tabs.Tab value="all">Tất cả</Tabs.Tab>
                                                <Tabs.Tab value="new">Mới nhất</Tabs.Tab>
                                                <Tabs.Tab value="best">Bán chạy</Tabs.Tab>
                                                <Tabs.Tab value="sale">Giảm giá</Tabs.Tab>
                                                <Tabs.Tab value="featured">Nổi bật</Tabs.Tab>
                                            </Tabs.List>
                                        </Tabs>
                                        <Group gap={0} style={{ border: isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
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
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <ProductGrid
                                    products={initialProducts}
                                    viewMode={viewMode}
                                    activeTab={activeTab || 'all'}
                                />
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Center mt="xl">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" size="md" radius="xl" px={40}>Xem Thêm Sản Phẩm</Button>
                                    </motion.div>
                                </Center>
                            </motion.div>
                        </Stack>
                    </motion.div>

                {/* Footer Promo */}
                <FooterPromo />
            </Stack>
        </Container>
    );
}
