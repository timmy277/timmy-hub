'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Carousel } from '@mantine/carousel';
import { Box, Group, Title, Text, Anchor, Skeleton } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';
import { campaignService, Campaign } from '@/services/campaign.service';

const POLLING_INTERVAL = 30000;

const TimerBlock = memo(function TimerBlock({ value, label }: { value: string; label: string }) {
    return (
        <Box style={{ textAlign: 'center' }}>
            <Box
                style={{
                    background: '#1c252e',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: 20,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 48,
                    display: 'inline-block',
                    fontFamily: 'Public Sans Variable, sans-serif',
                }}
            >
                {value}
            </Box>
            <Text
                size="xs"
                c="dimmed"
                mt={4}
                style={{
                    fontFamily: 'Public Sans Variable, sans-serif',
                    fontSize: 12,
                }}
            >
                {label}
            </Text>
        </Box>
    );
});

function FlashSaleBannerComponent() {
    const router = useRouter();

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ['campaigns', 'active'],
        queryFn: async () => {
            const res = await campaignService.getActiveCampaigns();
            return res.data || [];
        },
        refetchInterval: POLLING_INTERVAL,
        staleTime: POLLING_INTERVAL,
    });

    const activeCampaign = campaigns[0] as Campaign | undefined;

    const top5Products = useMemo(() => {
        if (!activeCampaign?.campaignProducts) return [];
        return [...activeCampaign.campaignProducts]
            .sort((a, b) => (b.product.soldCount || 0) - (a.product.soldCount || 0))
            .slice(0, 5)
            .map(cp => ({
                ...cp.product,
                price: cp.campaignPrice || cp.product.price,
                originalPrice: cp.product.price,
            })) as Product[];
    }, [activeCampaign]);

    const endTimestamp = useMemo(() => {
        if (!activeCampaign?.endDate) return null;
        return new Date(activeCampaign.endDate).getTime();
    }, [activeCampaign]);

    const [timer, setTimer] = useState({ h: '00', m: '00', s: '00' });

    useEffect(() => {
        if (!endTimestamp) return;
        const tick = () => {
            const diff = endTimestamp - Date.now();
            if (diff <= 0) { setTimer({ h: '00', m: '00', s: '00' }); return; }
            setTimer({
                h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
                m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
                s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endTimestamp]);

    if (isLoading) return <Skeleton height={240} radius={12} aria-label="Đang tải Flash Sale" />;
    if (!activeCampaign || top5Products.length === 0) return null;

    return (
        <Box
            p={32}
            style={{
                borderRadius: 16,
                border: '1px solid #ffe4e6',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fffbfb 100%)',
                boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08)',
            }}
            component="section"
            aria-labelledby="flash-sale-title"
        >
            {/* Header */}
            <Group justify="space-between" mb={24} align="center">
                <Group gap={16} align="center">
                    <Iconify icon="solar:fire-bold" width={32} color="#ff3030" aria-hidden="true" />
                    <Title
                        id="flash-sale-title"
                        order={2}
                        style={{
                            fontFamily: 'Barlow, sans-serif',
                            fontSize: 32,
                            fontWeight: 800,
                            color: '#1c252e',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Flash Sale
                    </Title>
                    <Group gap={8} align="flex-end" role="timer" aria-live="polite" aria-label={`Thời gian còn lại: ${timer.h} giờ ${timer.m} phút ${timer.s} giây`}>
                        <TimerBlock value={timer.h} label="giờ" />
                        <Text fw={700} c="dimmed" mb={16} aria-hidden="true">:</Text>
                        <TimerBlock value={timer.m} label="phút" />
                        <Text fw={700} c="dimmed" mb={16} aria-hidden="true">:</Text>
                        <TimerBlock value={timer.s} label="giây" />
                    </Group>
                </Group>
                <Anchor
                    fw={400}
                    size="md"
                    style={{
                        color: '#00a76f',
                        cursor: 'pointer',
                        fontFamily: 'Public Sans Variable, sans-serif',
                        fontSize: 16,
                        textDecoration: 'none',
                    }}
                    styles={{
                        root: {
                            '&:hover': {
                                textDecoration: 'underline',
                                color: '#007C56',
                            }
                        }
                    }}
                    onClick={() => activeCampaign && router.push(`/campaign/${activeCampaign.id}`)}
                    aria-label="Xem tất cả sản phẩm Flash Sale"
                >
                    Xem tất cả →
                </Anchor>
            </Group>

            <Carousel
                slideSize={{ base: '80%', xs: '50%', sm: '33%', md: '20%' }}
                slideGap="md"
                withControls={false}
                aria-label="Sản phẩm Flash Sale"
            >
                {top5Products.map((product) => (
                    <Carousel.Slide key={product.id}>
                        <ProductCard product={product} viewMode="flash-sale" />
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Box>
    );
}

export const FlashSaleBanner = memo(FlashSaleBannerComponent);
