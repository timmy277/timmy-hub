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
    ActionIcon,
    NumberInput,
    Divider,
    Badge,
    Box,
} from '@mantine/core';
import { IconTrash, IconShoppingCart, IconAlertTriangle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useDebouncedCallback } from '@mantine/hooks';
import Link from 'next/link';

export function CartPage() {
    const { user } = useAuth();
    const {
        cart,
        isLoading,
        updateQuantity,
        updateQuantityOptimistic,
        removeItem,
        clearCart,
        isRemoving,
        isClearing,
    } = useCart();
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        try {
            await updateQuantity({ itemId, dto: { quantity: newQuantity } });
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    // Debounced callback để gọi API sau 500ms
    const debouncedUpdateQuantity = useDebouncedCallback(
        (itemId: string, quantity: number) => {
            void handleUpdateQuantity(itemId, quantity);
        },
        500,
    );

    if (!user || isLoading) {
        return (
            <Container size="lg" py="xl">
                <Title order={2}>Đang tải giỏ hàng...</Title>
            </Container>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container size="lg" py="xl">
                <Paper p="xl" ta="center" withBorder>
                    <IconShoppingCart size={48} stroke={1.5} color="gray" />
                    <Title order={2} mt="md">
                        Giỏ hàng trống
                    </Title>
                    <Text c="dimmed" mt="sm">
                        Bạn chưa có sản phẩm nào trong giỏ hàng
                    </Text>
                    <Button component={Link} href="/" mt="lg" size="md">
                        Tiếp tục mua sắm
                    </Button>
                </Paper>
            </Container>
        );
    }

    const confirmRemoveItem = (itemId: string, productName: string) => {
        modals.openConfirmModal({
            title: (
                <Group gap="xs">
                    <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" />
                    <Text fw={600}>Xóa sản phẩm khỏi giỏ hàng</Text>
                </Group>
            ),
            children: (
                <Text size="sm">
                    Bạn có chắc chắn muốn xóa <Text span fw={600}>{productName}</Text> khỏi giỏ
                    hàng không?
                </Text>
            ),
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                void removeItem(itemId);
            },
        });
    };

    const confirmClearCart = () => {
        modals.openConfirmModal({
            title: (
                <Group gap="xs">
                    <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" />
                    <Text fw={600}>Xóa tất cả sản phẩm</Text>
                </Group>
            ),
            children: (
                <Text size="sm">
                    Bạn có chắc chắn muốn xóa <Text span fw={600}>tất cả</Text> sản phẩm trong giỏ
                    hàng không? Hành động này không thể hoàn tác.
                </Text>
            ),
            labels: { confirm: 'Xóa tất cả', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                void clearCart();
            },
        });
    };

    const liveItemCount = cart.items.reduce(
        (sum, item) => sum + (quantities[item.id] ?? item.quantity),
        0,
    );
    const liveTotalAmount = cart.items.reduce(
        (sum, item) =>
            sum +
            Number(item.product.price) * (quantities[item.id] ?? item.quantity),
        0,
    );

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={2}>Giỏ hàng của bạn</Title>
                {cart.items.length > 0 && (
                    <Button
                        variant="subtle"
                        color="red"
                        onClick={confirmClearCart}
                        loading={isClearing}
                    >
                        Xóa tất cả
                    </Button>
                )}
            </Group>

            <Group align="flex-start" gap="xl">
                <Stack style={{ flex: 1 }} gap="md">
                    {cart.items.map(item => {
                        const currentQuantity = quantities[item.id] ?? item.quantity;
                        const maxQty = Math.min(99, item.product.stock);

                        return (
                            <Paper key={item.id} p="md" withBorder>
                                <Group align="flex-start" gap="md">
                                    <Image
                                        src={item.product.images[0] || '/placeholder-product.jpg'}
                                        alt={item.product.name}
                                        w={100}
                                        h={100}
                                        fit="cover"
                                        radius="md"
                                    />

                                    <Stack style={{ flex: 1 }} gap="xs">
                                        <Group justify="space-between">
                                            <Box>
                                                <Text fw={600} size="md">
                                                    {item.product.name}
                                                </Text>
                                                {item.product.category && (
                                                    <Badge size="xs" variant="light" mt={4}>
                                                        {item.product.category.name}
                                                    </Badge>
                                                )}
                                            </Box>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() =>
                                                    confirmRemoveItem(
                                                        item.id,
                                                        item.product.name,
                                                    )
                                                }
                                                loading={isRemoving}
                                            >
                                                <IconTrash size={18} stroke={1.5} />
                                            </ActionIcon>
                                        </Group>

                                        <Group justify="space-between" align="center">
                                            <Group gap="md">
                                                <Text size="lg" fw={700} c="blue">
                                                    {Number(item.product.price).toLocaleString()}đ
                                                </Text>
                                                {item.product.originalPrice && (
                                                    <Text size="sm" td="line-through" c="dimmed">
                                                        {Number(item.product.originalPrice).toLocaleString()}đ
                                                    </Text>
                                                )}
                                            </Group>

                                            <NumberInput
                                                value={currentQuantity}
                                                onChange={value => {
                                                    const raw =
                                                        typeof value === 'number'
                                                            ? value
                                                            : Number(value);
                                                    if (!Number.isFinite(raw)) {
                                                        setQuantities(prev => ({
                                                            ...prev,
                                                            [item.id]: 1,
                                                        }));
                                                        updateQuantityOptimistic(item.id, 1);
                                                        void handleUpdateQuantity(item.id, 1);
                                                        return;
                                                    }
                                                    // Clamp về [1, stock] – nếu nhập quá sẽ tự nhảy về tồn kho
                                                    const next = Math.max(
                                                        1,
                                                        Math.min(raw, maxQty),
                                                    );
                                                    setQuantities(prev => ({
                                                        ...prev,
                                                        [item.id]: next,
                                                    }));
                                                    // Cập nhật cache ngay để badge và dropdown đổi theo
                                                    updateQuantityOptimistic(item.id, next);
                                                    // Debounce API call
                                                    debouncedUpdateQuantity(item.id, next);
                                                }}
                                                onBlur={() => {
                                                    const qty = Math.max(
                                                        1,
                                                        Math.min(
                                                            currentQuantity,
                                                            maxQty,
                                                        ),
                                                    );
                                                    if (qty !== item.quantity) {
                                                        void handleUpdateQuantity(item.id, qty);
                                                    }
                                                }}
                                                min={1}
                                                max={maxQty}
                                                clampBehavior="strict"
                                                allowDecimal={false}
                                                allowNegative={false}
                                                w={100}
                                            />
                                        </Group>

                                        <Group justify="space-between" mt="xs">
                                            <Text size="sm" c="dimmed">
                                                Còn lại: {item.product.stock} sản phẩm
                                            </Text>
                                            <Text size="md" fw={600}>
                                                Tạm tính:{' '}
                                                {(
                                                    Number(item.product.price) * currentQuantity
                                                ).toLocaleString()}
                                                đ
                                            </Text>
                                        </Group>
                                    </Stack>
                                </Group>
                            </Paper>
                        );
                    })}
                </Stack>

                <Paper p="lg" withBorder style={{ width: 350, position: 'sticky', top: 80 }}>
                    <Title order={3} mb="md">
                        Tóm tắt đơn hàng
                    </Title>

                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Text c="dimmed">Số lượng sản phẩm:</Text>
                            <Text fw={600}>{liveItemCount} sản phẩm</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text c="dimmed">Tạm tính:</Text>
                            <Text fw={600}>{liveTotalAmount.toLocaleString()}đ</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text c="dimmed">Phí vận chuyển:</Text>
                            <Text fw={600}>Miễn phí</Text>
                        </Group>

                        <Divider my="sm" />

                        <Group justify="space-between">
                            <Text size="lg" fw={700}>
                                Tổng cộng:
                            </Text>
                            <Text size="xl" fw={800} c="blue">
                                {liveTotalAmount.toLocaleString()}đ
                            </Text>
                        </Group>

                        <Button size="lg" fullWidth mt="md">
                            Thanh toán
                        </Button>

                        <Button component={Link} href="/" variant="light" fullWidth>
                            Tiếp tục mua sắm
                        </Button>
                    </Stack>
                </Paper>
            </Group>
        </Container>
    );
}
