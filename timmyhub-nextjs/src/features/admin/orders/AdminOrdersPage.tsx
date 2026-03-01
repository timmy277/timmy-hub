'use client';

import { useQuery } from '@tanstack/react-query';
import {
    Container,
    Title,
    Text,
    Paper,
    Group,
    Badge,
    Button,
    Loader,
    Table,
    Stack,
} from '@mantine/core';
import Link from 'next/link';
import { IconRefresh } from '@tabler/icons-react';
import { orderService } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types/order';
import { QUERY_KEYS, ORDER_STATUS_LABELS, getOrderStatusColor } from '@/constants';

export function AdminOrdersPage() {
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: QUERY_KEYS.ADMIN_ORDERS,
        queryFn: () => orderService.getAdminOrders(),
    });

    const orders = (res?.data ?? []) as Order[];

    return (
        <Container fluid px="1rem" py="md">
            <Paper shadow="md" radius="md" withBorder p="md">
                <Stack gap="lg">
                    <Group justify="space-between">
                        <Title order={3}>Quản lý đơn hàng</Title>
                        <Button
                            variant="outline"
                            leftSection={<IconRefresh size={16} />}
                            onClick={() => refetch()}
                            loading={isLoading}
                        >
                            Làm mới
                        </Button>
                    </Group>

                    {isLoading ? (
                        <Group justify="center" py="xl">
                            <Loader size="sm" />
                            <Text size="sm" c="dimmed">
                                Đang tải...
                            </Text>
                        </Group>
                    ) : orders.length === 0 ? (
                        <Paper p="xl" withBorder ta="center">
                            <Text c="dimmed">Chưa có đơn hàng nào.</Text>
                        </Paper>
                    ) : (
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Mã đơn</Table.Th>
                                    <Table.Th>Khách hàng</Table.Th>
                                    <Table.Th>Trạng thái</Table.Th>
                                    <Table.Th>Thanh toán</Table.Th>
                                    <Table.Th>Tổng tiền</Table.Th>
                                    <Table.Th>Ngày tạo</Table.Th>
                                    <Table.Th />
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {orders.map(order => {
                                    const email = order.user?.email ?? '-';
                                    const p = order.user?.profile;
                                    const fullName = (p?.displayName ?? [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim()) || '-';
                                    const displayUser = fullName !== '-' ? `${fullName} (${email})` : email;
                                    return (
                                        <Table.Tr key={order.id}>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>
                                                    #{order.id.slice(-8)}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{displayUser}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge size="sm" variant="light" color={getOrderStatusColor(order.status as OrderStatus)}>
                                                    {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{order.paymentStatus}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" fw={600}>
                                                    {Number(order.totalAmount).toLocaleString()}đ
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Button
                                                    component={Link}
                                                    href={`/admin/orders/${order.id}`}
                                                    size="xs"
                                                    variant="light"
                                                >
                                                    Chi tiết
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
}
