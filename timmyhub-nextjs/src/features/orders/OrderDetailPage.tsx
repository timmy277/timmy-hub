'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
} from '@mantine/core';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types/order';
import { QUERY_KEYS } from '@/constants';

export function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const { data: orderRes, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.ORDER(orderId),
        queryFn: () => orderService.getOrder(orderId),
        enabled: !!orderId,
    });

    const order = (orderRes as { data?: Order })?.data;

    if (isLoading || !orderId) {
        return (
            <Container size="md" py="xl">
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                    <Text>Đang tải đơn hàng...</Text>
                </Group>
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container size="md" py="xl">
                <Paper p="xl" withBorder ta="center">
                    <Text c="dimmed">Không tìm thấy đơn hàng hoặc bạn không có quyền xem.</Text>
                    <Button component={Link} href="/" mt="md">
                        Về trang chủ
                    </Button>
                </Paper>
            </Container>
        );
    }

    const items = order.orderItems ?? [];
    const total = Number(order.totalAmount);

    return (
        <Container size="md" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={2}>Đơn hàng #{order.id.slice(-8)}</Title>
                <Badge size="lg" variant="light" color={order.paymentStatus === 'COMPLETED' ? 'green' : 'blue'}>
                    {order.status}
                </Badge>
            </Group>

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
                            <Text fw={600}>
                                {Number(item.subtotal).toLocaleString()}đ
                            </Text>
                        </Group>
                    ))}
                </Stack>
                <Divider my="md" />
                <Group justify="space-between">
                    <Text size="lg" fw={700}>Tổng cộng:</Text>
                    <Text size="xl" fw={800} c="blue">
                        {total.toLocaleString()}đ
                    </Text>
                </Group>
            </Paper>

            <Group mt="lg" gap="sm">
                <Button component={Link} href="/profile/orders" variant="light">
                    Đơn hàng của tôi
                </Button>
                <Button component={Link} href="/" variant="subtle">
                    Về trang chủ
                </Button>
            </Group>
        </Container>
    );
}
