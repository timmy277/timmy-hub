'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Paper,
    Group,
    Title,
    Badge,
    Text,
    Box,
    Stack,
    Tabs,
    useComputedColorScheme,
    Skeleton,
    Grid,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { campaignService, Campaign } from '@/services/campaign.service';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';

const DEFAULT_BANNER = {
    backgroundColor: '#ff4d4f',
    titleColor: '#ffffff',
    badgeText: 'SIÊU SALE',
    icon: '⚡'
};

export default function CampaignDetailPage() {
    const params = useParams();
    const campaignId = params.id as string;
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';
    const [activeTab, setActiveTab] = useState<string | null>('all');

    // Fetch campaign details (đã bao gồm category của sản phẩm)
    const { data: campaign, isLoading, error } = useQuery({
        queryKey: ['campaign', 'active', campaignId],
        queryFn: async () => {
            const res = await campaignService.getActiveCampaign(campaignId);
            return res.data as Campaign;
        },
        enabled: !!campaignId,
    });

    // Convert campaign products to Product format
    const campaignProducts = useMemo(() => {
        if (!campaign?.campaignProducts) return [];
        return campaign.campaignProducts.map(cp => ({
            ...cp.product,
            categoryId: cp.product.categoryId,
            category: cp.product.category,
            price: cp.campaignPrice || cp.product.price,
            originalPrice: cp.product.price,
        })) as Product[];
    }, [campaign]);

    // Get unique categories from products (có sẵn từ API)
    const productCategories = useMemo(() => {
        const categorySet = new Map<string, { id: string; name: string }>();

        campaignProducts.forEach(product => {
            if (product.category?.id && product.category?.name) {
                categorySet.set(product.category.id, {
                    id: product.category.id,
                    name: product.category.name
                });
            }
        });

        return Array.from(categorySet.values());
    }, [campaignProducts]);

    // Group products by category
    const productsByCategory = useMemo(() => {
        const map = new Map<string, Product[]>();
        map.set('all', campaignProducts);

        campaignProducts.forEach(product => {
            const categoryId = product.categoryId;
            if (!categoryId) return;
            if (!map.has(categoryId)) {
                map.set(categoryId, []);
            }
            map.get(categoryId)?.push(product);
        });

        return map;
    }, [campaignProducts]);

    // Filter products by active tab
    const filteredProducts = useMemo(() => {
        if (!activeTab || activeTab === 'all') {
            return campaignProducts;
        }
        return productsByCategory.get(activeTab) || [];
    }, [activeTab, campaignProducts, productsByCategory]);

    // Timer
    const endTimestamp = useMemo(() => {
        if (!campaign?.endDate) return null;
        return new Date(campaign.endDate).getTime();
    }, [campaign]);

    const [timerDisplay, setTimerDisplay] = useState<string>('');

    useEffect(() => {
        if (!endTimestamp) return;

        const updateTimer = () => {
            const now = Date.now();
            const diff = endTimestamp - now;

            if (diff <= 0) {
                setTimerDisplay('Đã kết thúc');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimerDisplay(
                    `${days} ngày ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            } else {
                setTimerDisplay(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTimestamp]);

    const config = {
        backgroundColor: campaign?.backgroundColor || DEFAULT_BANNER.backgroundColor,
        titleColor: campaign?.titleColor || DEFAULT_BANNER.titleColor,
        badgeText: campaign?.badgeText || DEFAULT_BANNER.badgeText,
        icon: campaign?.icon || DEFAULT_BANNER.icon,
    };

    // Loading state
    if (isLoading) {
        return (
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    <Skeleton height={200} radius="lg" />
                    <Skeleton height={400} radius="lg" />
                </Stack>
            </Container>
        );
    }

    // Error or not found
    if (error || !campaign) {
        return (
            <Container size="xl" py="xl">
                <Paper p="xl" radius="lg" ta="center">
                    <Title order={3} c="red">Chiến dịch không tồn tại hoặc đã kết thúc</Title>
                </Paper>
            </Container>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Campaign Banner */}
                {campaign.banner ? (
                    <Paper
                        radius="lg"
                        style={{
                            backgroundImage: `url(${campaign.banner})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            height: 250,
                        }}
                    >
                        <Box
                            h="100%"
                            p="xl"
                            style={{
                                background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 100%)',
                                borderRadius: 'lg',
                                display: 'flex',
                                alignItems: 'flex-end',
                            }}
                        >
                            <Group justify="space-between" w="100%" align="flex-end">
                                <Stack gap="sm">
                                    <Group gap="sm">
                                        <Badge
                                            size="lg"
                                            style={{
                                                backgroundColor: config.backgroundColor,
                                                color: config.titleColor,
                                            }}
                                        >
                                            {config.icon} {config.badgeText}
                                        </Badge>
                                        {campaign.type && (
                                            <Badge variant="outline" color="white">
                                                {campaign.type}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Title order={1} c="white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                        {campaign.name}
                                    </Title>
                                    {campaign.description && (
                                        <Text c="white" size="md" maw={500} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                            {campaign.description}
                                        </Text>
                                    )}
                                </Stack>

                                {timerDisplay && (
                                    <Paper
                                        p="md"
                                        radius="md"
                                        bg="rgba(0,0,0,0.6)"
                                    >
                                        <Stack gap={4} align="center">
                                            <Group gap="xs">
                                                <Iconify icon="tabler:clock" width={20} color="white" />
                                                <Text c="white" fw={600}>Kết thúc sau</Text>
                                            </Group>
                                            <Text
                                                size="xl"
                                                fw={700}
                                                c="white"
                                                style={{ fontFamily: 'monospace', fontSize: 24 }}
                                            >
                                                {timerDisplay}
                                            </Text>
                                        </Stack>
                                    </Paper>
                                )}
                            </Group>
                        </Box>
                    </Paper>
                ) : (
                    <Paper
                        p="xl"
                        radius="lg"
                        style={{
                            background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${config.backgroundColor}dd 100%)`,
                            border: `2px solid ${config.backgroundColor}`,
                        }}
                    >
                        <Group justify="space-between" align="flex-end">
                            <Group gap="lg" align="flex-end">
                                <Text
                                    size="xl"
                                    fw={700}
                                    c={config.titleColor}
                                    style={{ fontSize: 48, lineHeight: 1 }}
                                >
                                    {config.icon}
                                </Text>
                                <Box>
                                    <Group gap="sm" mb="xs">
                                        <Badge
                                            size="lg"
                                            variant="filled"
                                            color="yellow"
                                        >
                                            {config.badgeText}
                                        </Badge>
                                        {campaign.type && (
                                            <Badge variant="outline" color="white">
                                                {campaign.type}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Title order={1} c={config.titleColor}>
                                        {campaign.name}
                                    </Title>
                                    {campaign.description && (
                                        <Text c={config.titleColor} opacity={0.9} size="md" mt="xs">
                                            {campaign.description}
                                        </Text>
                                    )}
                                </Box>
                            </Group>

                            {timerDisplay && (
                                <Paper
                                    p="md"
                                    radius="md"
                                    bg="rgba(255,255,255,0.2)"
                                >
                                    <Stack gap={4} align="center">
                                        <Group gap="xs">
                                            <Iconify icon="tabler:clock" width={20} color={config.titleColor} />
                                            <Text c={config.titleColor} fw={600}>Kết thúc sau</Text>
                                        </Group>
                                        <Text
                                            size="xl"
                                            fw={700}
                                            c={config.titleColor}
                                            style={{ fontFamily: 'monospace', fontSize: 24 }}
                                        >
                                            {timerDisplay}
                                        </Text>
                                    </Stack>
                                </Paper>
                            )}
                        </Group>
                    </Paper>
                )}

                {/* Campaign Stats */}
                <Grid>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="md" radius="md" bg={isDark ? 'gray.8' : 'gray.1'} h="100%">
                            <Group gap="sm">
                                <Iconify icon="tabler:flame" width={24} color={config.backgroundColor} />
                                <Box>
                                    <Text size="xs" c="dimmed">Tổng sản phẩm</Text>
                                    <Text fw={700} size="lg">{campaignProducts.length}</Text>
                                </Box>
                            </Group>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="md" radius="md" bg={isDark ? 'gray.8' : 'gray.1'} h="100%">
                            <Group gap="sm">
                                <Iconify icon="tabler:shopping-cart" width={24} color={config.backgroundColor} />
                                <Box>
                                    <Text size="xs" c="dimmed">Đã bán</Text>
                                    <Text fw={700} size="lg">
                                        {campaignProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0).toLocaleString('vi-VN')}
                                    </Text>
                                </Box>
                            </Group>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="md" radius="md" bg={isDark ? 'gray.8' : 'gray.1'} h="100%">
                            <Group gap="sm">
                                <Iconify icon="tabler:star" width={24} color="yellow" />
                                <Box>
                                    <Text size="xs" c="dimmed">Đánh giá TB</Text>
                                    <Text fw={700} size="lg">
                                        {(campaignProducts.reduce((sum, p) => sum + (p.ratingAvg || 0), 0) / (campaignProducts.length || 1)).toFixed(1)}
                                    </Text>
                                </Box>
                            </Group>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}>
                        <Paper p="md" radius="md" bg={isDark ? 'gray.8' : 'gray.1'} h="100%">
                            <Group gap="sm">
                                <Iconify icon="tabler:clock" width={24} color={config.backgroundColor} />
                                <Box>
                                    <Text size="xs" c="dimmed">Còn lại</Text>
                                    <Text fw={700} size="lg" c={timerDisplay === 'Đã kết thúc' ? 'red' : undefined}>
                                        {timerDisplay || '--:--:--'}
                                    </Text>
                                </Box>
                            </Group>
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Category Tabs & Products */}
                <Paper p="xl" radius="lg" bg={isDark ? 'gray.9' : 'gray.0'}>
                    <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="xl">
                        <Tabs.List mb="lg">
                            <Tabs.Tab value="all">
                                Tất cả ({campaignProducts.length})
                            </Tabs.Tab>
                            {productCategories.map((cat) => (
                                <Tabs.Tab key={cat.id} value={cat.id}>
                                    {cat.name} ({(productsByCategory.get(cat.id) || []).length})
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>

                        <Tabs.Panel value={activeTab || 'all'}>
                            {filteredProducts.length > 0 ? (
                                <Grid>
                                    {filteredProducts.map((product) => (
                                        <Grid.Col key={product.id} span={{ base: 6, xs: 4, sm: 3, md: 2 }}>
                                            <ProductCard product={product} viewMode="grid" />
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            ) : (
                                <Paper p="xl" radius="md" ta="center" bg={isDark ? 'gray.8' : 'gray.1'}>
                                    <Text c="dimmed">Không có sản phẩm nào</Text>
                                </Paper>
                            )}
                        </Tabs.Panel>
                    </Tabs>
                </Paper>

                {/* Campaign Vouchers */}
                {campaign.vouchers && campaign.vouchers.length > 0 && (
                    <Paper p="xl" radius="lg" bg={isDark ? 'gray.9' : 'gray.0'}>
                        <Title order={3} mb="lg">Voucher của chiến dịch</Title>
                        <Grid>
                            {campaign.vouchers.map((voucher) => (
                                <Grid.Col key={voucher.id} span={{ base: 12, sm: 6, md: 4 }}>
                                    <Paper
                                        p="md"
                                        radius="md"
                                        withBorder
                                        style={{
                                            borderColor: config.backgroundColor,
                                            borderStyle: 'dashed',
                                        }}
                                    >
                                        <Stack gap="xs">
                                            <Group justify="space-between">
                                                <Text fw={700} size="lg" c={config.backgroundColor}>
                                                    {voucher.type === 'PERCENTAGE'
                                                        ? `Giảm ${voucher.value}%`
                                                        : `Giảm ${voucher.value.toLocaleString('vi-VN')}đ`}
                                                </Text>
                                                <Badge color={config.backgroundColor} variant="light">
                                                    {voucher.type === 'PERCENTAGE' ? '%' : 'đ'}
                                                </Badge>
                                            </Group>
                                            {voucher.minOrderValue && (
                                                <Text size="sm" c="dimmed">
                                                    Tối thiểu {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                                                </Text>
                                            )}
                                            {voucher.maxDiscount && (
                                                <Text size="sm" c="dimmed">
                                                    Tối đa {voucher.maxDiscount.toLocaleString('vi-VN')}đ
                                                </Text>
                                            )}
                                            <Text size="sm">
                                                Mã: <Text span fw={700} ff="monospace">{voucher.code}</Text>
                                            </Text>
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Paper>
                )}
            </Stack>
        </Container>
    );
}
