'use client';

import { Title, Grid, Text, Stack, Loader, Center } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { wishlistService, WishlistItem } from '@/services/wishlist.service';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';
import { IconHeartOff } from '@tabler/icons-react';

export default function WishlistPage() {
    const { data: myWishlist, isLoading, error } = useQuery<WishlistItem[]>({
        queryKey: ['my-wishlist'],
        queryFn: () => wishlistService.getMyWishlist(),
    });

    if (isLoading) {
        return (
            <Center h={200}>
                <Loader color="blue" />
            </Center>
        );
    }

    if (error || !myWishlist) {
        return (
            <Stack align="center" mt="xl">
                <Text color="red">Đã có lỗi xảy ra khi tải danh sách yêu thích.</Text>
            </Stack>
        );
    }

    if (myWishlist.length === 0) {
        return (
            <Stack align="center" justify="center" h={300} gap="sm">
                <IconHeartOff size={48} color="var(--mantine-color-gray-4)" stroke={1.5} />
                <Title order={4} c="dimmed">Chưa có sản phẩm nào</Title>
                <Text size="sm" c="dimmed">
                    Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
                </Text>
            </Stack>
        );
    }

    return (
        <Stack gap="lg">
            <Title order={3}>Sản phẩm yêu thích ({myWishlist.length})</Title>
            
            <Grid>
                {myWishlist.map((item) => {
                    // Chuyển đổi dữ liệu tạm để khớp với interface Product của ProductCard
                    const productData = {
                        ...item.product,
                        createdAt: item.createdAt,
                        updatedAt: item.createdAt,
                    } as unknown as Product;

                    return (
                        <Grid.Col key={item.id} span={{ base: 12, xs: 6, sm: 4, lg: 3 }}>
                            <ProductCard product={productData} />
                        </Grid.Col>
                    );
                })}
            </Grid>
        </Stack>
    );
}
