'use client';

import { ReactElement, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid, Stack, Loader, Center, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/constants';
import { formatCompact } from '@/utils/currency';
import { StatCard } from './StatCard';
import { RevenueChart } from './RevenueChart';
import { OrderStatusChart } from './OrderStatusChart';
import { TopProducts } from './TopProducts';
import { RecentOrders } from './RecentOrders';
import { ActivityFeed } from './ActivityFeed';
import type { DashboardData } from '@/types/dashboard';

export function DashboardClient(): ReactElement {
    const { t } = useTranslation('common');
    const [period, setPeriod] = useState<'7d' | '30d'>('30d');
    const rangeDays = period === '7d' ? 7 : 30;

    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.DASHBOARD(rangeDays),
        queryFn: () => dashboardService.getDashboard(rangeDays),
        staleTime: 60 * 1000,
    });

    const d = data as DashboardData | undefined;

    if (isLoading) {
        return (
            <Center py="xl">
                <Loader size="md" />
            </Center>
        );
    }
    console.log(d);

    if (error || !d) {
        return (
            <Center py="xl">
                <Stack align="center" gap="xs">
                    <Text c="red">{t('common.somethingWentWrong')}</Text>
                    <Text size="xs" c="dimmed">
                        {String(error)}
                    </Text>
                </Stack>
            </Center>
        );
    }

    const { overview, revenueByDay, orderStatus, topProducts, recentOrders, recentActivity } = d;

    return (
        <Stack gap="lg">
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.totalRevenue')}
                        value={formatCompact(overview.totalRevenue) + 'đ'}
                        change={overview.revenueChange}
                        icon="tabler:currency-dollar"
                        color="green"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.totalOrders')}
                        value={formatCompact(overview.totalOrders)}
                        change={overview.ordersChange}
                        icon="tabler:shopping-cart"
                        color="blue"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.totalUsers')}
                        value={formatCompact(overview.totalUsers)}
                        change={overview.usersChange}
                        icon="tabler:users"
                        color="violet"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.totalProducts')}
                        value={formatCompact(overview.totalProducts)}
                        change={overview.productsChange}
                        icon="tabler:package"
                        color="orange"
                    />
                </Grid.Col>
            </Grid>

            <RevenueChart data={revenueByDay} period={period} onPeriodChange={setPeriod} />

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <OrderStatusChart data={orderStatus} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <TopProducts data={topProducts} />
                </Grid.Col>
            </Grid>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <RecentOrders data={recentOrders} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 6 }}>
                    <ActivityFeed data={recentActivity} />
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
