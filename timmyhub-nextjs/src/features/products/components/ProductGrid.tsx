'use client';

import { Text, Center, Skeleton, SimpleGrid, Stack } from '@mantine/core';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';
import { memo } from 'react';

interface ProductGridProps {
    products: Product[];
    viewMode: 'grid' | 'list';
    isLoading?: boolean;
}

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
        <>
            {viewMode === 'list' ? (
                <Stack gap="sm">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} viewMode="list" />
                    ))}
                </Stack>
            ) : (
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} viewMode="grid" />
                    ))}
                </SimpleGrid>
            )}
        </>
    );
}

export const ProductGrid = memo(ProductGridComponent);
