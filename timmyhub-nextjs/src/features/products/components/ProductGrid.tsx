'use client';

/**
 * ProductGrid - Hiển thị danh sách sản phẩm dạng grid hoặc list
 * Hỗ trợ loading skeleton khi đang fetch
 */

import { Text, Center, Skeleton, SimpleGrid } from '@mantine/core';
import { m, AnimatePresence } from 'framer-motion';
import { Grid as MantineGrid } from '@mantine/core';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
    products: Product[];
    viewMode: 'grid' | 'list';
    isLoading?: boolean;
}

const SKELETON_COUNT = 8;

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.35 },
};

export function ProductGrid({ products, viewMode, isLoading = false }: ProductGridProps) {
    if (isLoading) {
        return (
            <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4 }} spacing="lg">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <Skeleton key={i} height={320} radius="md" />
                ))}
            </SimpleGrid>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <m.div
                key={viewMode}
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
                <MantineGrid gutter="lg">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <MantineGrid.Col
                                key={product.id}
                                span={viewMode === 'list' ? 12 : { base: 12, xs: 6, sm: 4, md: 3 }}
                            >
                                <m.div variants={scaleIn}>
                                    <ProductCard product={product} viewMode={viewMode} />
                                </m.div>
                            </MantineGrid.Col>
                        ))
                    ) : (
                        <MantineGrid.Col span={12}>
                            <Center p="xl" h={200}>
                                <Text c="dimmed" size="lg">
                                    Không có sản phẩm nào cho bộ lọc này.
                                </Text>
                            </Center>
                        </MantineGrid.Col>
                    )}
                </MantineGrid>
            </m.div>
        </AnimatePresence>
    );
}
