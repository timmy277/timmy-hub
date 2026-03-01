'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Container,
    Title,
    Text,
    Paper,
    Stack,
    Group,
    Image,
    Badge,
    Button,
    Divider,
    Loader,
    Select,
} from '@mantine/core';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { orderService } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types/order';
import { PERMISSIONS } from '@/config/permissions';
import { useAuthStore } from '@/stores/useAuthStore';

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
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

export function AdminOrderDetailPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const orderId = params.id as string;
    const userPermissions = useAuthStore(s => s.user?.permissions ?? []);

    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

    const { data: orderRes, isLoading, error } = useQuery({
        queryKey: ['admin-order', orderId],
        queryFn: () => orderService.getAdminOrder(orderId),
        enabled: !!orderId,
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: OrderStatus) => orderService.updateOrderStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            notifications.show({ title: 'Thành công', message: 'Đã cập nhật trạng thái đơn hàng', color: 'green' });
            setSelectedStatus(null);
        },
        onError: (err: { response?: { status?: number }; message?: string }) => {
            notifications.show({
                title: 'Lỗi',
                message: err?.response?.status === 403 ? 'Bạn không có quyền cập nhật trạng thái' : (err?.message ?? 'Cập nhật thất bại'),
                color: 'red',
            });
        },
    });

    const order = (orderRes as { data?: Order })?.data;
    const canProcess = userPermissions.includes(PERMISSIONS.ORDERS.PROCESS);

    if (isLoading || !orderId) {
        return (
            <Container fluid px="1rem" py="md">
                <Paper shadow="md" radius="md" withBorder p="md">
                    <Group justify="center" py="xl">
                        <Loader size="lg" />
                        <Text>Đang tải đơn hàng...</Text>
                    </Group>
                </Paper>
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container fluid px="1rem" py="md">
                <Paper shadow="md" radius="md" withBorder p="xl" ta="center">
                    <Text c="dimmed">Không tìm thấy đơn hàng.</Text>
                    <Button component={Link} href="/admin/orders" mt="md">
                        Về danh sách đơn hàng
                    </Button>
                </Paper>
            </Container>
        );
    }

    const items = order.orderItems ?? [];
    const total = Number(order.totalAmount);
    const currentStatus = selectedStatus ?? (order.status as OrderStatus);

    return (
        <Container fluid px="1rem" py="md">
            <Paper shadow="md" radius="md" withBorder p="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Title order={2}>Đơn hàng #{order.id.slice(-8)}</Title>
                        <Badge size="lg" variant="light" color={order.paymentStatus === 'COMPLETED' ? 'green' : 'blue'}>
                            {order.status}
                        </Badge>
                    </Group>

                    {order.user && (
                        <Paper p="lg" withBorder mb="md">
                            <Text fw={600} mb="xs">Khách hàng</Text>
                            <Stack gap={4}>
                                <Text size="sm">
                                    {(order.user.profile?.displayName ?? [order.user.profile?.firstName, order.user.profile?.lastName].filter(Boolean).join(' ').trim()) || '-'}
                                </Text>
                                <Text size="sm" c="dimmed">{order.user.email ?? '-'}</Text>
                            </Stack>
                        </Paper>
                    )}

                    <Paper p="lg" withBorder mb="md">
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Trạng thái thanh toán:</Text>
                                <Text fw={600}>{order.paymentStatus}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Phương thức:</Text>
                                <Text fw={600}>{order.paymentMethod}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">Ngày tạo:</Text>
                                <Text>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                            </Group>
                        </Stack>
                    </Paper>

                    {canProcess && (
                        <Paper p="lg" withBorder mb="md">
                            <Text fw={600} mb="sm">Cập nhật trạng thái đơn hàng</Text>
                            <Group align="flex-end">
                                <Select
                                    label="Trạng thái"
                                    placeholder="Chọn trạng thái"
                                    data={ORDER_STATUS_OPTIONS}
                                    value={currentStatus}
                                    onChange={v => setSelectedStatus((v as OrderStatus) ?? null)}
                                    style={{ minWidth: 180 }}
                                />
                                <Button
                                    loading={updateStatusMutation.isPending}
                                    onClick={() => currentStatus && updateStatusMutation.mutate(currentStatus)}
                                >
                                    Cập nhật
                                </Button>
                            </Group>
                        </Paper>
                    )}

                    <Paper p="lg" withBorder>
                        <Text fw={600} mb="md">Sản phẩm ({items.length})</Text>
                        <Stack gap="sm">
                            {items.map(item => (
                                <Group key={item.id} gap="md">
                                    <Image
                                        src={item.image || '/placeholder-product.jpg'}
                                        alt={item.name}
                                        w={64}
                                        h={64}
                                        fit="cover"
                                        radius="sm"
                                    />
                                    <Stack gap={2} style={{ flex: 1 }}>
                                        <Text fw={500}>{item.name}</Text>
                                        <Text size="sm" c="dimmed">
                                            {item.quantity} x {Number(item.price).toLocaleString()}đ
                                        </Text>
                                    </Stack>
                                    <Text fw={600}>{Number(item.subtotal).toLocaleString()}đ</Text>
                                </Group>
                            ))}
                        </Stack>
                        <Divider my="md" />
                        <Group justify="space-between">
                            <Text size="lg" fw={700}>
                                Tổng cộng:
                            </Text>
                            <Text size="xl" fw={800} c="blue">
                                {total.toLocaleString()}đ
                            </Text>
                        </Group>
                    </Paper>

                    <Group mt="md" gap="sm">
                        <Button component={Link} href="/admin/orders" variant="light">
                            Danh sách đơn hàng
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        </Container>
    );
}
