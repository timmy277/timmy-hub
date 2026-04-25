'use client';

import { useState, useEffect, useMemo } from 'react';
import { Carousel } from '@mantine/carousel';
import { Box, Group, Title, Text, Anchor, Skeleton } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';
import { campaignService, Campaign } from '@/services/campaign.service';

const POLLING_INTERVAL = 30000;

function TimerBlock({ value, label }: { value: string; label: string }) {
    return (
        <Box style={{ textAlign: 'center' }}>
            <Box
                style={{
                    background: '#1c252e',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontWeight: 700,
                    fontSize: 18,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 40,
                    display: 'inline-block',
                }}
            >
                {value}
            </Box>
            <Text size="xs" c="dimmed" mt={2}>{label}</Text>
        </Box>
    );
}

export function FlashSaleBanner() {
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

    if (isLoading) return <Skeleton height={240} radius={12} />;
    if (!activeCampaign || top5Products.length === 0) return null;

    return (
        <Box
            p="xl"
            style={{
                borderRadius: 16,
                border: '1px solid #ffe4e6',
                background: '#fff5f5',
            }}
        >
            {/* Header */}
            <Group justify="space-between" mb={20} align="center">
                <Group gap={12} align="center">
                    <Iconify icon="solar:fire-bold" width={28} color="#ff3030" />
                    <Title order={3} style={{ fontSize: 20, fontWeight: 800, color: '#1c252e', letterSpacing: '-0.01em' }}>
                        Flash Sale
                    </Title>
                    <Group gap={6} align="flex-end">
                        <TimerBlock value={timer.h} label="giờ" />
                        <Text fw={700} c="dimmed" mb={16}>:</Text>
                        <TimerBlock value={timer.m} label="phút" />
                        <Text fw={700} c="dimmed" mb={16}>:</Text>
                        <TimerBlock value={timer.s} label="giây" />
                    </Group>
                </Group>
                <Anchor
                    fw={600}
                    size="sm"
                    style={{ color: '#00a76f' }}
                    onClick={() => activeCampaign && router.push(`/campaign/${activeCampaign.id}`)}
                >
                    Xem tất cả →
                </Anchor>
            </Group>

            <Carousel slideSize={{ base: '80%', xs: '50%', sm: '33%', md: '20%' }} slideGap="md" withControls={false}>
                {top5Products.map((product) => (
                    <Carousel.Slide key={product.id}>
                        <ProductCard product={product} viewMode="flash-sale" />
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Box>
    );
}
