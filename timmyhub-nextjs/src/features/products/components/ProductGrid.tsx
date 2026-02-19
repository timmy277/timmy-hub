'use client';

import { Text, Center } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid as MantineGrid } from '@mantine/core';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
    products: Product[];
    viewMode: 'grid' | 'list';
    activeTab: string;
}

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 }
};

export function ProductGrid({ products, viewMode, activeTab }: ProductGridProps) {
    const filterProducts = (products: Product[]): Product[] => {
        switch (activeTab) {
            case 'new':
                return products.filter(p => p.isNew);
            case 'sale':
                return products.filter(p => p.originalPrice && p.originalPrice > p.price);
            case 'best':
                return products.filter(p => p.ratingAvg >= 4.8);
            case 'featured':
                return products.filter(p => p.isFeatured);
            default:
                return products;
        }
    };

    const displayProducts = filterProducts(products);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${viewMode}-${activeTab}`}
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
                <MantineGrid gutter="lg">
                    {displayProducts.length > 0 ? (
                        displayProducts.map((product) => (
                            <MantineGrid.Col
                                key={product.id}
                                span={viewMode === 'list' ? 12 : { base: 12, xs: 6, sm: 4, md: 3 }}
                            >
                                <motion.div variants={scaleIn}>
                                    <ProductCard product={product} viewMode={viewMode} />
                                </motion.div>
                            </MantineGrid.Col>
                        ))
                    ) : (
                        <MantineGrid.Col span={12}>
                            <Center p="xl" h={200}>
                                <Text c="dimmed">Không có sản phẩm nào cho bộ lọc này.</Text>
                            </Center>
                        </MantineGrid.Col>
                    )}
                </MantineGrid>
            </motion.div>
        </AnimatePresence>
    );
}
