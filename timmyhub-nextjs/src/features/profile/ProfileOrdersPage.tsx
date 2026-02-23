'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Title,
    Text,
    Tabs,
    Paper,
    Stack,
    Group,
    Badge,
    Button,
    Loader,
    Image,
} from '@mantine/core';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types/order';

const ALL_VALUE = 'all';

const ORDER_STATUS_LIST: { value: OrderStatus | typeof ALL_VALUE; label: string }[] = [
    { value: ALL_VALUE, label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'PACKED', label: 'Đã đóng gói' },
    { value: 'SHIPPING', label: 'Đang giao' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'RETURN_REQUESTED', label: 'Yêu cầu trả hàng' },
    { value: 'RETURNED', label: 'Đã trả hàng' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

function statusColor(status: OrderStatus): string {
    switch (status) {
        case 'COMPLETED':
        case 'DELIVERED':
            return 'green';
        case 'CANCELLED':
        case 'REFUNDED':
            return 'red';
        case 'PENDING':
            return 'gray';
        case 'SHIPPING':
        case 'PROCESSING':
            return 'blue';
        default:
            return 'teal';
    }
}

function OrderCard({ order }: { order: Order }) {
    const items = order.orderItems ?? [];
    const firstImage = items[0]?.image;
    const total = Number(order.totalAmount);
    const shortId = order.id.slice(-8);
    const date = new Date(order.createdAt).toLocaleDateString('vi-VN');

    return (
        <Paper p="md" withBorder radius="md" component={Link} href={`/profile/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Group wrap="nowrap" gap="md" style={{ flex: 1, minWidth: 0 }}>
                    {firstImage ? (
                        <Image
                            src={firstImage}
                            alt=""
                            w={56}
                            h={56}
                            fit="cover"
                            radius="sm"
                        />
                    ) : (
                        <Box w={56} h={56} bg="gray.2" radius="sm" />
                    )}
                    <Stack gap={2} style={{ minWidth: 0 }}>
                        <Text fw={600} size="sm">#{shortId}</Text>
                        <Text size="xs" c="dimmed">{date}</Text>
                        <Text size="sm" c="dimmed">{items.length} sản phẩm</Text>
                    </Stack>
                </Group>
                <Stack gap={4} align="flex-end">
                    <Badge size="sm" variant="light" color={statusColor(order.status as OrderStatus)}>
                        {ORDER_STATUS_LIST.find(s => s.value === order.status)?.label ?? order.status}
                    </Badge>
                    <Text fw={700} c="blue">{total.toLocaleString()}đ</Text>
                    <Button size="xs" variant="light" component="span">Xem chi tiết</Button>
                </Stack>
            </Group>
        </Paper>
    );
}

export function ProfileOrdersPage() {
    const [status, setStatus] = useState<OrderStatus | typeof ALL_VALUE>(ALL_VALUE);

    const apiStatus = status === ALL_VALUE ? undefined : status;

    const { data: res, isLoading } = useQuery({
        queryKey: ['my-orders', apiStatus],
        queryFn: () => orderService.getMyOrders(apiStatus),
    });

    const orders = (res?.data ?? []) as Order[];

    return (
        <Box>
            <Title order={3} mb="md">Đơn hàng của tôi</Title>

            <Tabs value={status} onChange={v => setStatus((v as OrderStatus | typeof ALL_VALUE) ?? ALL_VALUE)}>
                <Tabs.List mb="md" style={{ flexWrap: 'wrap', gap: 4 }}>
                    {ORDER_STATUS_LIST.map(({ value, label }) => (
                        <Tabs.Tab key={value} value={value}>
                            {label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            {isLoading ? (
                <Group justify="center" py="xl">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">Đang tải...</Text>
                </Group>
            ) : orders.length === 0 ? (
                <Paper p="xl" withBorder ta="center">
                    <Text c="dimmed">Chưa có đơn hàng nào.</Text>
                    <Button component={Link} href="/" variant="light" mt="md">
                        Mua sắm ngay
                    </Button>
                </Paper>
            ) : (
                <Stack gap="sm">
                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </Stack>
            )}
        </Box>
    );
}
