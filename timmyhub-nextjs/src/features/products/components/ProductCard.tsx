'use client';

import {
    Card,
    Group,
    Badge,
    Image,
    Text,
    Stack,
    Grid,
    Title,
    Box,
    Flex,
    Progress,
    Anchor,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Product } from '@/types/product';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { formatVND } from '@/utils/currency';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list' | 'flash-sale';
    hideAddToCart?: boolean;
}

export function ProductCard({ product, viewMode = 'grid', hideAddToCart }: ProductCardProps) {
    const discountPercentage = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    const soldPercentage = product.stock > 0
        ? Math.min((product.soldCount / (product.soldCount + product.stock)) * 100, 100)
        : 100;

    const productLink = `/product/${product.slug}`;

    // Flash Sale variant
    if (viewMode === 'flash-sale') {
        return (
            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
            >
                <Card
                    shadow="sm"
                    padding="xs"
                    radius="md"
                    withBorder
                    h="100%"
                    style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}
                >
                    {/* Link overlay phủ toàn card, không bao phủ buttons */}
                    <Link
                        href={productLink}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 0,
                        }}
                        aria-label={product.name}
                    />
                    <Card.Section>
                        <Box pos="relative" h={180}>
                            <Image
                                src={product.images[0] || '/placeholder-product.jpg'}
                                h={180}
                                w="100%"
                                fit="cover"
                                alt={product.name}
                            />
                            {discountPercentage > 0 && (
                                <Badge color="red" variant="filled" pos="absolute" top={10} left={10}>
                                    -{discountPercentage}%
                                </Badge>
                            )}
                        </Box>
                    </Card.Section>
                    <Stack gap={4} mt="sm">
                        <Text size="sm" lineClamp={2} fw={600} style={{ minHeight: 42 }}>
                            {product.name}
                        </Text>
                        <Text size="lg" fw={800} c="red">
                            {formatVND(product.price)}
                        </Text>
                        {product.originalPrice && (
                            <Text size="xs" td="line-through" c="dimmed">
                                {formatVND(product.originalPrice)}
                            </Text>
                        )}
                        <Stack gap={2} mt={5}>
                            <Group justify="space-between">
                                <Text size="xs" c="red" fw={700}>
                                    Đã bán {product.soldCount}
                                </Text>
                                <Iconify icon="tabler:flame" width={14} color="orange" />
                            </Group>
                            <Progress
                                value={soldPercentage}
                                color="red"
                                size="md"
                                radius="xl"
                                animated
                                striped
                            />
                            <Text size="xs" c="dimmed">
                                Còn lại {product.stock} sản phẩm
                            </Text>
                        </Stack>
                    </Stack>
                </Card>
            </m.div>
        );
    }

    if (viewMode === 'list') {
        return (
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
            >
                <Card
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                    style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}
                >
                    <Link
                        href={productLink}
                        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                        aria-label={product.name}
                    />
                    <Grid>
                        <Grid.Col span={3}>
                            <Box h={180}>
                                <Image
                                    src={product.images[0] || '/placeholder-product.jpg'}
                                    radius="md"
                                    h={180}
                                    w="100%"
                                    fit="cover"
                                    alt={product.name}
                                />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={9}>
                            <Flex direction="column" h="100%" justify="space-between">
                                <Stack gap="xs">
                                    <Group justify="space-between">
                                        <Badge color="gray">{product.category?.name || 'Chưa phân loại'}</Badge>
                                        {product.isNew && <Badge color="green">Hàng Mới</Badge>}
                                        {product.isFeatured && <Badge color="orange">Nổi Bật</Badge>}
                                    </Group>
                                    <Anchor
                                        component={Link}
                                        href={productLink}
                                        underline="never"
                                        c="inherit"
                                        style={{ position: 'relative', zIndex: 1 }}
                                        className="product-name-link"
                                    >
                                        <Title order={4}>{product.name}</Title>
                                    </Anchor>
                                    <Group gap={4}>
                                        <Iconify icon="tabler:star" width={16} style={{ fill: 'orange' }} color="orange" />
                                        <Text size="sm">{product.ratingAvg.toFixed(1)} ({product.ratingCount} đánh giá)</Text>
                                    </Group>
                                    <Text lineClamp={2} c="dimmed" size="sm">
                                        {product.description || 'Chưa có mô tả'}
                                    </Text>
                                </Stack>
                                <Group justify="space-between" mt="md" style={{ position: 'relative', zIndex: 1 }}>
                                    <Stack gap={0}>
                                        <Text size="xl" fw={800} c="blue">
                                            {formatVND(product.price)}
                                        </Text>
                                        {product.originalPrice && (
                                            <Text size="sm" td="line-through" c="dimmed">
                                                {formatVND(product.originalPrice)}
                                            </Text>
                                        )}
                                    </Stack>
                                    <Group>
                                        <WishlistButton productId={product.id} variantType="button" />
                                        {!hideAddToCart && (
                                            <AddToCartButton
                                                productId={product.id}
                                                variant="button"
                                                disabled={product.stock === 0}
                                            />
                                        )}
                                    </Group>
                                </Group>
                            </Flex>
                        </Grid.Col>
                    </Grid>
                </Card>
            </m.div>
        );
    }

    return (
        <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
        >
            <Card
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                h="100%"
                style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}
            >
                <Link
                    href={productLink}
                    style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                    aria-label={product.name}
                />
                <Card.Section>
                    <Box pos="relative" h={220}>
                        <Image
                            src={product.images[0] || '/placeholder-product.jpg'}
                            h={220}
                            w="100%"
                            fit="cover"
                            alt={product.name}
                        />
                        {product.isNew && (
                            <Badge color="green" pos="absolute" top={10} right={10}>
                                Mới
                            </Badge>
                        )}
                        {product.isFeatured && (
                            <Badge color="orange" pos="absolute" top={10} left={10}>
                                Nổi bật
                            </Badge>
                        )}
                        {discountPercentage > 0 && (
                            <Badge color="red" pos="absolute" top={product.isNew ? 50 : 10} left={10}>
                                -{discountPercentage}%
                            </Badge>
                        )}
                        <WishlistButton
                            productId={product.id}
                            pos="absolute"
                            bottom={10}
                            right={10}
                        />
                    </Box>
                </Card.Section>
                <Flex direction="column" style={{ flex: 1 }} mt="md">
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            {product.category?.name || 'Chưa phân loại'}
                        </Text>
                        <Anchor
                            component={Link}
                            href={productLink}
                            fw={600}
                            size="md"
                            lineClamp={2}
                            underline="never"
                            c="inherit"
                            title={product.name}
                            style={{
                                display: '-webkit-box',
                                minHeight: 48,
                                position: 'relative',
                                zIndex: 1,
                                transition: 'color 0.15s ease',
                            }}
                            className="product-name-link"
                        >
                            {product.name}
                        </Anchor>

                        <Group gap={4}>
                            <Iconify icon="tabler:star" width={14} style={{ fill: 'orange' }} color="orange" />
                            <Text size="xs">{product.ratingAvg.toFixed(1)}</Text>
                            <Text size="xs" c="dimmed">({product.ratingCount} đánh giá)</Text>
                        </Group>
                    </Stack>

                    <Stack gap="xs" mt="xs">
                        <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }}>
                            <Stack gap={0}>
                                <Text size="xl" fw={800} c="blue">
                                    {formatVND(product.price)}
                                </Text>
                                {product.originalPrice && (
                                    <Text size="xs" td="line-through" c="dimmed">
                                        {formatVND(product.originalPrice)}
                                    </Text>
                                )}
                            </Stack>
                            {!hideAddToCart && (
                                <AddToCartButton productId={product.id} disabled={product.stock === 0} />
                            )}
                        </Group>

                        {product.stock <= 10 && product.stock > 0 && (
                            <Text size="xs" c="orange" fw={600}>
                                Chỉ còn {product.stock} sản phẩm
                            </Text>
                        )}
                        {product.stock === 0 && (
                            <Text size="xs" c="red" fw={600}>
                                Hết hàng
                            </Text>
                        )}
                    </Stack>
                </Flex>
            </Card>
        </m.div>
    );
}
