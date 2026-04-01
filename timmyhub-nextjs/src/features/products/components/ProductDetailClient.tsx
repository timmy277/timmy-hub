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
    Box,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatVND } from '@/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/product';
import { ProductImageGallery } from './ProductImageGallery';
import { AppBreadcrumbs, type BreadcrumbItem } from '@/components/shared';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { ReviewList } from '@/features/reviews';
import { campaignService } from '@/services/campaign.service';

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart, isAdding } = useCart();
    const [quantity, setQuantity] = useState(1);

    // Fetch campaign price for this product
    const { data: campaignData } = useQuery({
        queryKey: ['product-campaign-price', product.id],
        queryFn: async () => {
            const res = await campaignService.getProductCampaignPrice(product.id);
            return res.data;
        },
        staleTime: 30000, // 30 seconds
    });

    // Use campaign price if available
    const hasCampaign = !!campaignData;
    const displayPrice = hasCampaign && campaignData?.campaignPrice
        ? Number(campaignData.campaignPrice)
        : product.price;
    const originalPrice = product.originalPrice || product.price;
    const discountPercent = hasCampaign && campaignData?.discountPercent
        ? campaignData.discountPercent
        : originalPrice > product.price
            ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
            : 0;

    const isOutOfStock = product.stock === 0;
    const maxQuantity = Math.min(99, product.stock);

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Trang chủ', href: '/' },
        ...(product.category
            ? [{
                title: product.category.name,
                href: `/category/${product.category.slug ?? product.category.id}`,
                icon: <Iconify icon="solar:tag-bold" width={14} />,
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

                        {/* Title and Wishlist */}
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Title order={1} size="h2" style={{ flex: 1 }}>
                                {product.name}
                            </Title>
                            <WishlistButton productId={product.id} variantType="icon" size="xl" />
                        </Group>

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
                            {/* Campaign Badge */}
                            {hasCampaign && (
                                <Group gap="xs" mb="xs">
                                    <Badge
                                        size="lg"
                                        variant="filled"
                                        color="red"
                                        leftSection={<Iconify icon="tabler:bolt" width={14} />}
                                    >
                                        {campaignData?.campaignType === 'FLASH_SALE' ? 'Flash Sale' : 'Giảm giá'}
                                    </Badge>
                                    <Text size="sm" c="dimmed">
                                        {campaignData?.campaignName}
                                    </Text>
                                </Group>
                            )}
                            <Group gap="md" align="flex-end">
                                <Text size="xl" fw={700} c={hasCampaign ? 'red' : 'blue'} style={{ fontSize: '2rem' }}>
                                    {formatVND(displayPrice)}
                                </Text>
                                {(discountPercent > 0 || (hasCampaign && originalPrice > displayPrice)) && (
                                    <>
                                        <Text size="lg" td="line-through" c="dimmed">
                                            {formatVND(originalPrice)}
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
                                    leftSection={<Iconify icon="tabler:shopping-cart" width={20} />}
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
                                <Alert color="blue" icon={<Iconify icon="tabler:alert-circle" width={16} />}>
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
                                            <Iconify icon="tabler:building-store" width={24} />
                                        </Avatar>
                                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                            <Group gap={6} wrap="nowrap">
                                                <Text fw={600} size="sm" truncate="end">
                                                    {product.seller.sellerProfile.shopName}
                                                </Text>
                                                {product.seller.sellerProfile.isVerified && (
                                                    <ThemeIcon size={16} color="blue" variant="transparent" p={0}>
                                                        <Iconify icon="tabler:shield-check" width={16} />
                                                    </ThemeIcon>
                                                )}
                                            </Group>
                                            <Group gap="xs">
                                                <Group gap={4}>
                                                    <Iconify icon="tabler:star" width={12} style={{ color: 'var(--mantine-color-yellow-6)' }} />
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
                                    <Iconify icon="tabler:chevron-right" width={16} color="var(--mantine-color-dimmed)" />
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
                    <Text size="sm" lh={1.8} style={{ whiteSpace: 'pre-line' }}>
                        {product.description}
                    </Text>
                </Paper>
            )}

            {/* Reviews */}
            <Paper p="xl" radius="md" withBorder mt="xl">
                <ReviewList
                    productId={product.id}
                    ratingAvg={product.ratingAvg}
                    ratingCount={product.ratingCount}
                />
            </Paper>
        </Container>
    );
}
