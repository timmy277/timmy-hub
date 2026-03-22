'use client';

import { ReactElement } from 'react';
import { Paper, Text, Stack, Group, Badge, Anchor, Box } from '@mantine/core';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { formatVND } from '@/utils/currency';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import type { RecentOrder } from '@/types/dashboard';

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface RecentOrdersProps {
    data: RecentOrder[];
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'yellow',
    CONFIRMED: 'blue',
    PROCESSING: 'violet',
    PACKED: 'purple',
    SHIPPING: 'cyan',
    DELIVERED: 'teal',
    COMPLETED: 'green',
    CANCELLED: 'red',
    RETURN_REQUESTED: 'orange',
    RETURNED: 'orange',
    REFUNDED: 'gray',
};

export function RecentOrders({ data }: RecentOrdersProps): ReactElement {
    const { t, i18n } = useTranslation('common');
    const isVi = i18n.language === 'vi';

    if (!data.length) {
        return (
            <Paper withBorder radius="lg" p="lg">
                <Text fw={600} size="lg" mb="md">
                    {t('dashboard.recentOrders')}
                </Text>
                <Text c="dimmed" size="sm" ta="center" py="xl">
                    {t('dashboard.noData')}
                </Text>
            </Paper>
        );
    }

    return (
        <Paper withBorder radius="lg" p="lg">
            <Group justify="space-between" mb="md">
                <Text fw={600} size="lg">
                    {t('dashboard.recentOrders')}
                </Text>
                <Anchor component={Link} href="/admin/orders" size="xs">
                    {t('dashboard.viewAll')}
                </Anchor>
            </Group>
            <Stack gap={0}>
                {data.map((order, idx) => {
                    const color = STATUS_COLORS[order.status] ?? 'gray';
                    const label = t(`order.status.${order.status}`, order.status);
                    return (
                        <Group
                            key={order.id}
                            justify="space-between"
                            py="xs"
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            style={{ borderBottom: idx < data.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                        >
                            <Stack gap={4}>
                                <Group gap="xs">
                                    <Text size="sm" fw={600} ff="monospace">
                                        #{order.orderNumber}
                                    </Text>
                                    <Badge size="xs" variant="light" color={color}>
                                        {label}
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    {order.userName} · {dayjs(order.createdAt).locale(isVi ? 'vi' : 'en').fromNow()}
                                </Text>
                            </Stack>
                            <Stack gap={2} align="flex-end">
                                <Text size="sm" fw={700}>
                                    {formatVND(order.totalAmount)}
                                </Text>
                                <Anchor
                                    component={Link}
                                    href={`/admin/orders/${order.id}`}
                                    size="xs"
                                    className="text-blue-500 hover:underline"
                                >
                                    {t('dashboard.view')}
                                </Anchor>
                            </Stack>
                        </Group>
                    );
                })}
            </Stack>
        </Paper>
    );
}
