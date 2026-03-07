'use client';

/**
 * Component trang gian hàng công khai của seller
 * Hiển thị thông tin shop + danh sách sản phẩm đã duyệt
 */

import {
    Container,
    Grid,
    Group,
    Stack,
    Text,
    Title,
    Avatar,
    Badge,
    Paper,
    SimpleGrid,
    Divider,
    ThemeIcon,
    Box,
    Button,
} from '@mantine/core';
import { IconBuildingStore, IconShieldCheck, IconStar, IconPackage, IconCalendar, IconMessage } from '@tabler/icons-react';
import { SellerShop } from '@/types/product';
import { ProductCard } from '@/features/products/components/ProductCard';
import { AppBreadcrumbs, type BreadcrumbItem } from '@/components/shared';

interface SellerShopClientProps {
    shop: SellerShop;
}

export function SellerShopClient({ shop }: SellerShopClientProps) {
    const sellerName =
        shop.user.profile?.displayName ||
        `${shop.user.profile?.firstName ?? ''} ${shop.user.profile?.lastName ?? ''}`.trim() ||
        shop.shopName;

    const joinedDate = new Date(shop.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
    });

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Trang chủ', href: '/' },
        { title: 'Gian hàng', href: '/shops', icon: <IconBuildingStore size={14} /> },
        { title: shop.shopName },
    ];

    return (
        <Container size="xl" py="xl">
            {/* Breadcrumb */}
            <AppBreadcrumbs items={breadcrumbItems} />

            {/* Shop Header */}
            <Paper p="xl" radius="lg" withBorder mb="xl">
                <Grid align="center">
                    <Grid.Col span={{ base: 12, sm: 'content' }}>
                        <Avatar
                            src={shop.shopLogo ?? shop.user.profile?.avatar ?? null}
                            size={100}
                            radius="lg"
                            color="blue"
                        >
                            <IconBuildingStore size={48} />
                        </Avatar>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 'auto' }}>
                        <Stack gap="xs">
                            <Group gap="sm" wrap="nowrap">
                                <Title order={2}>{shop.shopName}</Title>
                                {shop.isVerified && (
                                    <Badge
                                        leftSection={
                                            <ThemeIcon size={14} color="blue" variant="transparent" p={0}>
                                                <IconShieldCheck size={14} />
                                            </ThemeIcon>
                                        }
                                        color="blue"
                                        variant="light"
                                        size="md"
                                    >
                                        Đã xác minh
                                    </Badge>
                                )}
                            </Group>

                            <Text size="sm" c="dimmed">
                                Người bán: {sellerName}
                            </Text>

                            {shop.description && (
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                    {shop.description}
                                </Text>
                            )}

                            <Group mt="xs">
                                <Button 
                                    leftSection={<IconMessage size={16} />} 
                                    variant="light" 
                                    color="blue" 
                                    size="sm"
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('openChat', { 
                                            detail: { 
                                                id: shop.userId, 
                                                name: shop.shopName, 
                                                avatar: shop.shopLogo ?? shop.user.profile?.avatar
                                            } 
                                        }));
                                    }}
                                >
                                    Chat với người bán
                                </Button>
                            </Group>

                            <Group gap="xl" mt="xs">
                                <Group gap={6}>
                                    <IconStar size={16} style={{ color: 'var(--mantine-color-yellow-6)' }} />
                                    <Text size="sm" fw={600}>
                                        {shop.rating.toFixed(1)}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        đánh giá
                                    </Text>
                                </Group>

                                <Group gap={6}>
                                    <IconPackage size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                                    <Text size="sm" fw={600}>
                                        {shop.products.length}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        sản phẩm
                                    </Text>
                                </Group>

                                <Group gap={6}>
                                    <IconCalendar size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                                    <Text size="sm" c="dimmed">
                                        Tham gia {joinedDate}
                                    </Text>
                                </Group>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Paper>

            <Divider mb="xl" />

            {/* Product List */}
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Title order={3}>
                        Sản phẩm của gian hàng{' '}
                        <Text component="span" c="dimmed" fw={400} size="lg">
                            ({shop.products.length})
                        </Text>
                    </Title>
                </Group>

                {shop.products.length === 0 ? (
                    <Box ta="center" py="xl">
                        <ThemeIcon size={64} color="gray" variant="light" radius="xl" mx="auto" mb="md">
                            <IconPackage size={32} />
                        </ThemeIcon>
                        <Text c="dimmed" size="lg">
                            Gian hàng chưa có sản phẩm nào
                        </Text>
                    </Box>
                ) : (
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                        {shop.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </SimpleGrid>
                )}
            </Stack>
        </Container>
    );
}
