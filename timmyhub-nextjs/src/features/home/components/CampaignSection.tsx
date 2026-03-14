'use client';

/**
 * CampaignSection - Hiển thị campaign đang hoạt động trên trang chủ
 * Real-time với polling: cập nhật mỗi 30 giây
 */

import { useState, useEffect, useMemo } from 'react';
import {
    Paper,
    Group,
    Title,
    Badge,
    Button,
    Text,
    Box,
    Stack,
    useComputedColorScheme,
    Skeleton,
} from '@mantine/core';
import { IconFlame, IconClock, IconChevronRight } from '@tabler/icons-react';
import { m } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { campaignService, Campaign } from '@/services/campaign.service';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';

const POLLING_INTERVAL = 30000; // 30 seconds - real-time updates

const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 }
};

// Default campaign banner if none provided
const DEFAULT_BANNER = {
    backgroundColor: '#ff4d4f',
    titleColor: '#ffffff',
    badgeText: 'SIÊU SALE',
    icon: '⚡'
};

export function CampaignSection() {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    // Fetch active campaigns with polling
    const { data: campaigns = [], isLoading, error } = useQuery({
        queryKey: ['campaigns', 'active'],
        queryFn: async () => {
            const res = await campaignService.getActiveCampaigns();
            return res.data || [];
        },
        refetchInterval: POLLING_INTERVAL, // Real-time polling
        staleTime: POLLING_INTERVAL,
    });

    // Get the first active campaign (for now, show one main campaign)
    const activeCampaign = campaigns[0] as Campaign | undefined;

    // Convert campaign products to Product format for ProductCard
    const campaignProducts = useMemo(() => {
        if (!activeCampaign?.campaignProducts) return [];
        return activeCampaign.campaignProducts.map(cp => ({
            ...cp.product,
            price: cp.campaignPrice || cp.product.price,
            originalPrice: cp.product.price, // Original price before campaign
        })) as Product[];
    }, [activeCampaign]);

    // Calculate time remaining - just return end timestamp, effect handles real-time updates
    const endTimestamp = useMemo(() => {
        if (!activeCampaign?.endDate) return null;
        return new Date(activeCampaign.endDate).getTime();
    }, [activeCampaign]);

    // Update timer every second
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

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimerDisplay(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTimestamp]);

    // Campaign config with defaults
    const config = {
        backgroundColor: activeCampaign?.backgroundColor || DEFAULT_BANNER.backgroundColor,
        titleColor: activeCampaign?.titleColor || DEFAULT_BANNER.titleColor,
        badgeText: activeCampaign?.badgeText || DEFAULT_BANNER.badgeText,
        icon: activeCampaign?.icon || DEFAULT_BANNER.icon,
    };

    // Don't render if no active campaign
    if (!isLoading && !activeCampaign) {
        return null;
    }

    // Loading state
    if (isLoading) {
        return (
            <Box my="xl">
                <Skeleton height={200} radius="lg" />
            </Box>
        );
    }

    // Error state
    if (error || !activeCampaign) {
        return null;
    }

    return (
        <m.div
            variants={scaleIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
        >
            {/* Campaign Banner */}
            {activeCampaign.banner ? (
                <Paper
                    radius="lg"
                    mb="lg"
                    style={{
                        backgroundImage: `url(${activeCampaign.banner})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: 180,
                    }}
                >
                    <Box
                        h="100%"
                        p="lg"
                        style={{
                            background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            borderRadius: 'lg',
                            display: 'flex',
                            alignItems: 'flex-end',
                        }}
                    >
                        <Group justify="space-between" w="100%">
                            <Stack gap="xs">
                                <Badge
                                    size="lg"
                                    style={{
                                        backgroundColor: config.backgroundColor,
                                        color: config.titleColor,
                                    }}
                                >
                                    {config.icon} {config.badgeText}
                                </Badge>
                                <Title order={2} c="white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                    {activeCampaign.name}
                                </Title>
                                {activeCampaign.description && (
                                    <Text c="white" size="sm" maw={400} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                        {activeCampaign.description}
                                    </Text>
                                )}
                            </Stack>

                            {timerDisplay && (
                                <Group gap="xs" align="center">
                                    <IconClock size={20} color="white" />
                                    <Badge
                                        size="xl"
                                        variant="filled"
                                        color="dark"
                                        radius="sm"
                                        style={{ fontFamily: 'monospace', fontSize: 18 }}
                                    >
                                        {timerDisplay}
                                    </Badge>
                                </Group>
                            )}
                        </Group>
                    </Box>
                </Paper>
            ) : (
                // Fallback: Simple campaign banner
                <Paper
                    p="xl"
                    radius="lg"
                    mb="lg"
                    style={{
                        background: `linear-gradient(135deg, ${config.backgroundColor} 0%, ${config.backgroundColor}dd 100%)`,
                        border: `2px solid ${config.backgroundColor}`,
                    }}
                >
                    <Group justify="space-between" align="flex-end">
                        <Group gap="md" align="flex-end">
                            <Text
                                size="xl"
                                fw={700}
                                c={config.titleColor}
                                style={{ fontSize: 32, lineHeight: 1 }}
                            >
                                {config.icon}
                            </Text>
                            <Box>
                                <Badge
                                    size="lg"
                                    variant="filled"
                                    color="yellow"
                                    mb="xs"
                                >
                                    {config.badgeText}
                                </Badge>
                                <Title order={2} c={config.titleColor}>
                                    {activeCampaign.name}
                                </Title>
                                {activeCampaign.description && (
                                    <Text c={config.titleColor} opacity={0.9} size="sm">
                                        {activeCampaign.description}
                                    </Text>
                                )}
                            </Box>
                        </Group>

                        {timerDisplay && (
                            <Group gap="xs" align="center">
                                <IconClock size={20} color={config.titleColor} />
                                <Text
                                    size="xl"
                                    fw={700}
                                    c={config.titleColor}
                                    style={{ fontFamily: 'monospace', fontSize: 24 }}
                                >
                                    {timerDisplay}
                                </Text>
                            </Group>
                        )}
                    </Group>
                </Paper>
            )}

            {/* Campaign Products */}
            {campaignProducts.length > 0 && (
                <Paper p="xl" radius="lg" bg={isDark ? 'gray.9' : 'gray.0'}>
                    <Group justify="space-between" mb="lg">
                        <Group gap="xs">
                            <IconFlame size={24} color={config.backgroundColor} />
                            <Title order={3}>Sản phẩm trong chiến dịch</Title>
                        </Group>
                        <Button
                            variant="subtle"
                            rightSection={<IconChevronRight size={16} />}
                            color={config.backgroundColor}
                        >
                            Xem tất cả
                        </Button>
                    </Group>

                    <Group gap="md">
                        {campaignProducts.slice(0, 6).map((product) => (
                            <Box key={product.id} w={{ base: '45%', xs: '30%', sm: '20%', md: '16.66%' }}>
                                <ProductCard product={product} viewMode="flash-sale" />
                            </Box>
                        ))}
                    </Group>
                </Paper>
            )}

            {/* Campaign Vouchers */}
            {activeCampaign.vouchers && activeCampaign.vouchers.length > 0 && (
                <Paper p="xl" radius="lg" mt="lg" bg={isDark ? 'gray.9' : 'gray.0'}>
                    <Title order={3} mb="lg">Voucher của chiến dịch</Title>
                    <Group gap="md">
                        {activeCampaign.vouchers.map((voucher) => (
                            <Paper
                                key={voucher.id}
                                p="md"
                                radius="md"
                                withBorder
                                style={{
                                    borderColor: config.backgroundColor,
                                    borderStyle: 'dashed',
                                }}
                            >
                                <Stack gap={4}>
                                    <Text fw={700} size="lg" c={config.backgroundColor}>
                                        {voucher.type === 'PERCENTAGE'
                                            ? `Giảm ${voucher.value}%`
                                            : `Giảm ${voucher.value.toLocaleString('vi-VN')}đ`}
                                    </Text>
                                    {voucher.minOrderValue && (
                                        <Text size="xs" c="dimmed">
                                            Đơn tối thiểu {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                                        </Text>
                                    )}
                                    <Text size="xs" c="dimmed" mt={4}>
                                        Mã: <Text span fw={700} ff="monospace">{voucher.code}</Text>
                                    </Text>
                                </Stack>
                            </Paper>
                        ))}
                    </Group>
                </Paper>
            )}
        </m.div>
    );
}
