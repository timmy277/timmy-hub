'use client';

import { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Stack,
    Group,
    Button,
    Badge,
    Grid,
    Paper,
    Divider,
    NumberInput,
    Anchor,
    Alert,
    Avatar,
    ThemeIcon,
} from '@mantine/core';
import { IconShoppingCart, IconAlertCircle, IconBuildingStore, IconShieldCheck, IconStar, IconChevronRight, IconTag } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/product';
import { ProductImageGallery } from './ProductImageGallery';
import { AppBreadcrumbs, type BreadcrumbItem } from '@/components/shared';

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart, isAdding } = useCart();
    const [quantity, setQuantity] = useState(1);

    const isOutOfStock = product.stock === 0;
    const maxQuantity = Math.min(99, product.stock);
    const discountPercent = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Trang chủ', href: '/' },
        ...(product.category
            ? [{
                title: product.category.name,
                href: `/category/${product.category.slug ?? product.category.id}`,
                icon: <IconTag size={14} />,
            }]
            : []),
        { title: product.name },
    ];

    const handleAddToCart = async () => {
        if (!user) {
            router.push('/login?callbackUrl=' + encodeURIComponent(`/product/${product.slug}`));
            return;
        }

        await addToCart({ productId: product.id, quantity });
    };

    const handleBuyNow = async () => {
        if (!user) {
            router.push('/login?callbackUrl=' + encodeURIComponent(`/product/${product.slug}`));
            return;
        }

        try {
            await addToCart({ productId: product.id, quantity });
            router.push('/cart');
        } catch {
            // Error notification đã được xử lý trong useCart hook
        }
    };

    return (
        <Container size="xl" py="xl">
            {/* Breadcrumb */}
            <AppBreadcrumbs items={breadcrumbItems} />

            <Grid gutter="xl">
                {/* Image Gallery */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <ProductImageGallery images={product.images} productName={product.name} />
                </Grid.Col>

                {/* Product Info */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="lg">
                        {/* Category & Status */}
                        <Group gap="sm">
                            {product.category && (
                                <Badge size="lg" variant="light" color="blue">
                                    {product.category.name}
                                </Badge>
                            )}
                            {product.isNew && (
                                <Badge size="lg" variant="filled" color="green">
                                    Mới
                                </Badge>
                            )}
                            {product.isFeatured && (
                                <Badge size="lg" variant="filled" color="orange">
                                    Nổi bật
                                </Badge>
                            )}
                            {isOutOfStock && (
                                <Badge size="lg" variant="filled" color="red">
                                    Hết hàng
                                </Badge>
                            )}
                        </Group>

                        {/* Title */}
                        <Title order={1} size="h2">
                            {product.name}
                        </Title>

                        {/* Rating & Sold */}
                        <Group gap="lg">
                            {product.ratingCount > 0 && (
                                <Group gap={4}>
                                    <Text size="sm" c="dimmed">
                                        ⭐ {product.ratingAvg.toFixed(1)}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        ({product.ratingCount} đánh giá)
                                    </Text>
                                </Group>
                            )}
                            <Text size="sm" c="dimmed">
                                Đã bán: {product.soldCount}
                            </Text>
                        </Group>

                        {/* Price */}
                        <Stack gap={4}>
                            <Group gap="md" align="flex-end">
                                <Text size="xl" fw={700} c="blue" style={{ fontSize: '2rem' }}>
                                    {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                                </Text>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <>
                                        <Text size="lg" td="line-through" c="dimmed">
                                            {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}đ
                                        </Text>
                                        <Badge size="lg" variant="filled" color="red">
                                            -{discountPercent}%
                                        </Badge>
                                    </>
                                )}
                            </Group>
                        </Stack>

                        <Divider />

                        {/* Stock & Quantity */}
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Text fw={500}>Số lượng:</Text>
                                <Text c={isOutOfStock ? 'red' : 'green'} fw={600}>
                                    {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
                                </Text>
                            </Group>

                            {!isOutOfStock && (
                                <Group>
                                    <Text fw={500} w={100}>
                                        Chọn số lượng:
                                    </Text>
                                    <NumberInput
                                        value={quantity}
                                        onChange={(value) => {
                                            const num = typeof value === 'number' ? value : Number(value);
                                            if (Number.isFinite(num)) {
                                                setQuantity(Math.max(1, Math.min(num, maxQuantity)));
                                            }
                                        }}
                                        min={1}
                                        max={maxQuantity}
                                        clampBehavior="strict"
                                        allowDecimal={false}
                                        allowNegative={false}
                                        w={120}
                                    />
                                </Group>
                            )}
                        </Stack>

                        <Divider />

                        {/* Action Buttons */}
                        <Stack gap="sm">
                            <Group gap="md">
                                <Button
                                    size="lg"
                                    radius="md"
                                    leftSection={<IconShoppingCart size={20} />}
                                    onClick={handleAddToCart}
                                    loading={isAdding}
                                    disabled={isOutOfStock}
                                    style={{ flex: 1 }}
                                >
                                    Thêm vào giỏ hàng
                                </Button>
                                <Button
                                    size="lg"
                                    radius="md"
                                    variant="filled"
                                    color="blue"
                                    onClick={handleBuyNow}
                                    loading={isAdding}
                                    disabled={isOutOfStock}
                                    style={{ flex: 1 }}
                                >
                                    Mua ngay
                                </Button>
                            </Group>

                            {!user && (
                                <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                                    <Text size="sm">
                                        Vui lòng{' '}
                                        <Anchor component={Link} href="/login" c="blue">
                                            đăng nhập
                                        </Anchor>{' '}
                                        để mua hàng
                                    </Text>
                                </Alert>
                            )}
                        </Stack>

                        {/* Seller Card */}
                        {product.seller?.sellerProfile && (
                            <Paper
                                component={Link}
                                href={`/shop/${product.seller.sellerProfile.shopSlug}`}
                                p="md"
                                radius="md"
                                withBorder
                                style={{ textDecoration: 'none', cursor: 'pointer' }}
                            >
                                <Group justify="space-between" wrap="nowrap">
                                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                        <Avatar
                                            src={product.seller.sellerProfile.shopLogo ?? product.seller.profile?.avatar ?? null}
                                            size={48}
                                            radius="md"
                                            color="blue"
                                        >
                                            <IconBuildingStore size={24} />
                                        </Avatar>
                                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                            <Group gap={6} wrap="nowrap">
                                                <Text fw={600} size="sm" truncate="end">
                                                    {product.seller.sellerProfile.shopName}
                                                </Text>
                                                {product.seller.sellerProfile.isVerified && (
                                                    <ThemeIcon size={16} color="blue" variant="transparent" p={0}>
                                                        <IconShieldCheck size={16} />
                                                    </ThemeIcon>
                                                )}
                                            </Group>
                                            <Group gap="xs">
                                                <Group gap={4}>
                                                    <IconStar size={12} style={{ color: 'var(--mantine-color-yellow-6)' }} />
                                                    <Text size="xs" c="dimmed">
                                                        {product.seller.sellerProfile.rating.toFixed(1)}
                                                    </Text>
                                                </Group>
                                                <Text size="xs" c="dimmed">·</Text>
                                                <Text size="xs" c="blue">
                                                    Xem gian hàng
                                                </Text>
                                            </Group>
                                        </Stack>
                                    </Group>
                                    <IconChevronRight size={16} color="var(--mantine-color-dimmed)" />
                                </Group>
                            </Paper>
                        )}

                        {/* Product Info Cards */}
                        <Stack gap="sm">
                            <Paper p="md" radius="md" withBorder>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">
                                        Mã sản phẩm:
                                    </Text>
                                    <Text size="sm" fw={500}>
                                        {product.sku || product.id.slice(0, 8).toUpperCase()}
                                    </Text>
                                </Group>
                            </Paper>

                            {product.weight && (
                                <Paper p="md" radius="md" withBorder>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">
                                            Trọng lượng:
                                        </Text>
                                        <Text size="sm" fw={500}>
                                            {product.weight}kg
                                        </Text>
                                    </Group>
                                </Paper>
                            )}
                        </Stack>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Description */}
            {product.description && (
                <Paper p="xl" radius="md" withBorder mt="xl">
                    <Title order={3} mb="md">
                        Mô tả sản phẩm
                    </Title>
                    <Text size="sm" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                        {product.description}
                    </Text>
                </Paper>
            )}
        </Container>
    );
}
