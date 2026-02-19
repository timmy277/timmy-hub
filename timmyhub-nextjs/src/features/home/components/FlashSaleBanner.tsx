'use client';

import { Carousel } from '@mantine/carousel';
import { Paper, Group, Title, Badge, Button, Text, useComputedColorScheme } from '@mantine/core';
import { IconFlame } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 }
};

interface FlashSaleBannerProps {
    products: Product[];
}

export function FlashSaleBanner({ products }: FlashSaleBannerProps) {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    // Filter products with discount for flash sale
    const flashSaleProducts = products
        .filter(p => p.originalPrice && p.originalPrice > p.price)
        .slice(0, 5); // Limit to 5 products for carousel

    return (
        <motion.div variants={scaleIn} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8 }}>
            <Paper p="xl" radius="lg" bg={isDark ? 'red.9' : 'red.0'} style={{ border: '2px solid var(--mantine-color-red-filled)' }} my="xl">
                <Group justify="space-between" mb="lg" align="flex-end">
                    <Group gap="xs">
                        <IconFlame size={32} color="red" fill="orange" />
                        <Title order={2} c="red.8" tt="uppercase" style={{ letterSpacing: 1 }}>Flash Sale</Title>
                        <Badge size="lg" color="red" variant="filled" ml="md">Kết thúc sau</Badge>
                        <Group gap={4}>
                            <Badge size="lg" color="dark" radius="sm">02</Badge> :
                            <Badge size="lg" color="dark" radius="sm">15</Badge> :
                            <Badge size="lg" color="dark" radius="sm">40</Badge>
                        </Group>
                    </Group>
                    <Button variant="white" color="red" radius="xl">Xem tất cả &gt;</Button>
                </Group>

                {flashSaleProducts.length > 0 ? (
                    <Carousel slideSize={{ base: '80%', xs: '50%', sm: '33%', md: '20%' }} slideGap="md">
                        {flashSaleProducts.map((product) => (
                            <Carousel.Slide key={product.id}>
                                <ProductCard product={product} viewMode="flash-sale" />
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                ) : (
                    <Paper p="lg" radius="md" bg={isDark ? 'red.8' : 'red.1'}>
                        <Text c="red.6" ta="center">Chưa có sản phẩm flash sale nào</Text>
                    </Paper>
                )}
            </Paper>
        </motion.div>
    )
}
