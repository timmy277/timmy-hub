'use client';

import {
    Container,
    Title,
    Text,
    Stack,
    Group,
    Button,
    Paper,
    Image,
    Divider,
    Box,
    Loader,
    Alert,
} from '@mantine/core';
import { IconCreditCard, IconAlertCircle } from '@tabler/icons-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { notifications } from '@mantine/notifications';

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    const ax = err as { response?: { data?: { message?: string } } };
    const apiMessage = ax.response?.data?.message;
    if (typeof apiMessage === 'string') return apiMessage;
    return 'Có lỗi xảy ra, vui lòng thử lại';
}

type CartItem = { id: string; product: { price: number | string; name: string; images?: string[] }; quantity: number };
type AnyRes = Record<string, unknown>;

async function buildPaymentUrl(
    cartItems: CartItem[],
    refetchCart: () => Promise<{ data?: { items?: CartItem[] } }>,
): Promise<{ paymentUrl: string } | null> {
    const { data: freshCart } = await refetchCart();
    const items = (freshCart as { items?: CartItem[] } | undefined)?.items ?? cartItems;
    if (!items?.length) return null;

    const orderRes = await orderService.createFromCart({ paymentMethod: 'VNPAY' }) as unknown as AnyRes;
    const orderData = (orderRes as { data?: { id?: string } }).data;
    if (!orderData?.id) {
        const msg = (orderRes as { message?: string }).message;
        throw new Error(msg !== undefined ? msg : 'Tạo đơn hàng thất bại');
    }

    const payRes = await paymentService.createVnpayUrl({ orderId: orderData.id }) as unknown as AnyRes;
    const payData = (payRes as { data?: { url?: string } }).data;
    if (!payData?.url) {
        const msg = (payRes as { message?: string }).message;
        throw new Error(msg !== undefined ? msg : 'Tạo link thanh toán thất bại');
    }

    return { paymentUrl: payData.url };
}

export function CheckoutPage() {
    const { user } = useAuth();
    const { cart, isLoading: cartLoading, refetch: refetchCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePayWithVnpay = async () => {
        if (!cart || cart.items.length === 0) return;
        setIsSubmitting(true);
        let result: { paymentUrl: string } | null = null;
        try {
            result = await buildPaymentUrl(cart.items as CartItem[], refetchCart as () => Promise<{ data?: { items?: CartItem[] } }>);
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: getErrorMessage(err),
                color: 'red',
            });
            setIsSubmitting(false);
            return;
        }
        if (!result) {
            notifications.show({
                title: 'Giỏ hàng đã thay đổi',
                message: 'Giỏ hàng trống hoặc đã được cập nhật. Vui lòng kiểm tra lại giỏ hàng.',
                color: 'orange',
            });
            setIsSubmitting(false);
            return;
        }
        window.location.href = result.paymentUrl;
        setIsSubmitting(false);
    };

    if (!user || cartLoading) {
        return (
            <Container size="lg" py="xl">
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                    <Text>Đang tải...</Text>
                </Group>
            </Container>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container size="lg" py="xl">
                <Paper p="xl" withBorder>
                    <Alert
                        icon={<IconAlertCircle size={18} />}
                        title="Giỏ hàng trống"
                        color="blue"
                    >
                        Bạn chưa có sản phẩm nào để thanh toán. Vui lòng thêm sản phẩm vào giỏ
                        hàng trước.
                    </Alert>
                    <Button component={Link} href="/cart" mt="md">
                        Xem giỏ hàng
                    </Button>
                </Paper>
            </Container>
        );
    }

    const totalAmount = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
    );
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="xl">
                Thanh toán
            </Title>

            <Group align="flex-start" gap="xl">
                <Stack style={{ flex: 1 }} gap="md">
                    <Paper p="md" withBorder>
                        <Text fw={600} mb="sm">
                            Sản phẩm ({itemCount})
                        </Text>
                        <Stack gap="sm">
                            {cart.items.map(item => (
                                <Group key={item.id} gap="sm">
                                    <Image
                                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                        alt={item.product.name}
                                        w={56}
                                        h={56}
                                        fit="cover"
                                        radius="sm"
                                    />
                                    <Box style={{ flex: 1 }}>
                                        <Text size="sm" fw={500}>
                                            {item.product.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {item.quantity} x {Number(item.product.price).toLocaleString()}đ
                                        </Text>
                                    </Box>
                                    <Text size="sm" fw={600}>
                                        {(Number(item.product.price) * item.quantity).toLocaleString()}đ
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>

                <Paper p="lg" withBorder style={{ width: 360, position: 'sticky', top: 80 }}>
                    <Title order={4} mb="md">
                        Tóm tắt
                    </Title>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                Tạm tính ({itemCount} sp):
                            </Text>
                            <Text fw={600}>{totalAmount.toLocaleString()}đ</Text>
                        </Group>
                        <Divider />
                        <Group justify="space-between">
                            <Text fw={600}>Tổng cộng:</Text>
                            <Text size="lg" fw={700} c="blue">
                                {totalAmount.toLocaleString()}đ
                            </Text>
                        </Group>
                    </Stack>

                    <Button
                        size="md"
                        fullWidth
                        mt="lg"
                        leftSection={<IconCreditCard size={18} />}
                        onClick={handlePayWithVnpay}
                        loading={isSubmitting}
                    >
                        Thanh toán qua VNPay
                    </Button>

                    <Button component={Link} href="/cart" variant="light" fullWidth mt="sm">
                        Quay lại giỏ hàng
                    </Button>
                </Paper>
            </Group>
        </Container>
    );
}
