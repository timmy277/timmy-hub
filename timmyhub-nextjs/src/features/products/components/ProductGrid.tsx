'use client';

import { Text, Center, Skeleton, SimpleGrid, Stack } from '@mantine/core';
import { m, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';
import { memo } from 'react';

interface ProductGridProps {
    products: Product[];
    viewMode: 'grid' | 'list';
    isLoading?: boolean;
}

const stagger = {
    initial: {},
    animate: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
};

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

function ProductGridComponent({ products, viewMode, isLoading = false }: ProductGridProps) {
    if (isLoading) {
        return (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} style={{ aspectRatio: '1/1', borderRadius: 12 }} />
                ))}
            </SimpleGrid>
        );
    }

    if (products.length === 0) {
        return (
            <Center h={200}>
                <Text c="dimmed" size="lg">Không có sản phẩm nào.</Text>
            </Center>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <m.div
                key={viewMode}
                variants={stagger}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
                {viewMode === 'list' ? (
                    <Stack gap="sm">
                        {products.map(product => (
                            <m.div key={product.id} variants={fadeUp}>
                                <ProductCard product={product} viewMode="list" />
                            </m.div>
                        ))}
                    </Stack>
                ) : (
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                        {products.map(product => (
                            <m.div key={product.id} variants={fadeUp}>
                                <ProductCard product={product} viewMode="grid" />
                            </m.div>
                        ))}
                    </SimpleGrid>
                )}
            </m.div>
        </AnimatePresence>
    );
}

export const ProductGrid = memo(ProductGridComponent);
