'use client';

import { useState, useEffect, useMemo } from 'react';
import { Carousel } from '@mantine/carousel';
import { Paper, Group, Title, Badge, Button, Text, useComputedColorScheme, Box, Skeleton } from '@mantine/core';
import { IconFlame } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Product } from '@/types/product';
import { campaignService, Campaign } from '@/services/campaign.service';

const POLLING_INTERVAL = 30000;

export function FlashSaleBanner() {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';
    const router = useRouter();

    // Fetch active campaigns
    const { data: campaigns = [], isLoading, error } = useQuery({
        queryKey: ['campaigns', 'active'],
        queryFn: async () => {
            const res = await campaignService.getActiveCampaigns();
            return res.data || [];
        },
        refetchInterval: POLLING_INTERVAL,
        staleTime: POLLING_INTERVAL,
    });

    const activeCampaign = campaigns[0] as Campaign | undefined;

    // Get top 5 best-selling products from campaign
    const top5Products = useMemo(() => {
        if (!activeCampaign?.campaignProducts) return [];
        const sorted = [...activeCampaign.campaignProducts].sort(
            (a, b) => (b.product.soldCount || 0) - (a.product.soldCount || 0)
        );
        return sorted.slice(0, 5).map(cp => ({
            ...cp.product,
            price: cp.campaignPrice || cp.product.price,
            originalPrice: cp.product.price,
        })) as Product[];
    }, [activeCampaign]);

    // Timer from campaign endDate
    const endTimestamp = useMemo(() => {
        if (!activeCampaign?.endDate) return null;
        return new Date(activeCampaign.endDate).getTime();
    }, [activeCampaign]);

    const [timer, setTimer] = useState({ hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        if (!endTimestamp) return;

        const updateTimer = () => {
            const now = Date.now();
            const diff = endTimestamp - now;

            if (diff <= 0) {
                setTimer({ hours: '00', minutes: '00', seconds: '00' });
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimer({
                hours: hours.toString().padStart(2, '0'),
                minutes: minutes.toString().padStart(2, '0'),
                seconds: seconds.toString().padStart(2, '0')
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTimestamp]);

    const handleViewAll = () => {
        if (activeCampaign) {
            router.push(`/campaign/${activeCampaign.id}`);
        }
    };

    if (isLoading) {
        return (
            <Box my="xl">
                <Skeleton height={200} radius="lg" />
            </Box>
        );
    }

    if (error || !activeCampaign || top5Products.length === 0) {
        return null;
    }

    return (
        <Box my="xl">
            <Paper p="xl" radius="lg" bg={isDark ? 'red.9' : 'red.0'} style={{ border: '2px solid var(--mantine-color-red-filled)' }}>
                <Group justify="space-between" mb="lg" align="flex-end">
                    <Group gap="xs">
                        <IconFlame size={32} color="red" fill="orange" />
                        <Title order={2} c="red.8" tt="uppercase" style={{ letterSpacing: 1 }}>Flash Sale</Title>
                        <Badge size="lg" color="red" variant="filled" ml="md">Kết thúc sau</Badge>
                        <Group gap={4}>
                            <Badge size="lg" color="dark" radius="sm">{timer.hours}</Badge> :
                            <Badge size="lg" color="dark" radius="sm">{timer.minutes}</Badge> :
                            <Badge size="lg" color="dark" radius="sm">{timer.seconds}</Badge>
                        </Group>
                    </Group>
                    <Button variant="white" color="red" radius="xl" onClick={handleViewAll}>Xem tất cả &gt;</Button>
                </Group>

                {top5Products.length > 0 ? (
                    <Carousel slideSize={{ base: '80%', xs: '50%', sm: '33%', md: '20%' }} slideGap="md">
                        {top5Products.map((product) => (
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
        </Box>
    );
}
