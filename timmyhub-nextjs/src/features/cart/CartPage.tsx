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
import Iconify from '@/components/iconify/Iconify';
import { modals } from '@mantine/modals';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useDebouncedCallback } from '@mantine/hooks';
import Link from 'next/link';
import { formatVND } from '@/utils/currency';
import { useTranslation } from 'react-i18next';

export function CartPage() {
    const { user } = useAuth();
    const { t } = useTranslation('common');
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
                <Title order={2}>{t('cartPage.loading')}</Title>
            </Container>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container size="lg" py="xl">
                <Paper p="xl" ta="center" withBorder>
                    <Iconify icon="tabler:shopping-cart" width={48} stroke={1.5} color="gray" />
                    <Title order={2} mt="md">
                        {t('cartPage.emptyTitle')}
                    </Title>
                    <Text c="dimmed" mt="sm">
                        {t('cartPage.emptyDesc')}
                    </Text>
                    <Button component={Link} href="/" mt="lg" size="md">
                        {t('cartPage.continueShopping')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    const confirmRemoveItem = (itemId: string, productName: string) => {
        modals.openConfirmModal({
            title: (
                <Group gap="xs">
                    <Iconify icon="tabler:alert-triangle" width={18} color="var(--mantine-color-red-6)" />
                    <Text fw={600}>{t('cartPage.removeItem')}</Text>
                </Group>
            ),
            children: (
                <Text size="sm">
                    {t('cartPage.removeItemConfirm')} <Text span fw={600}>{productName}</Text> {t('cartPage.removeItemSuffix')}
                </Text>
            ),
            labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
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
                    <Iconify icon="tabler:alert-triangle" width={18} color="var(--mantine-color-red-6)" />
                    <Text fw={600}>{t('cartPage.clearCartTitle')}</Text>
                </Group>
            ),
            children: (
                <Text size="sm">
                    {t('cartPage.clearCartConfirm')} <Text span fw={600}>{t('cartPage.clearCartAll')}</Text> {t('cartPage.clearCartSuffix')}
                </Text>
            ),
            labels: { confirm: t('cartPage.clearCartConfirmBtn'), cancel: t('common.cancel') },
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
                <Title order={2}>{t('cartPage.yourCart')}</Title>
                {cart.items.length > 0 && (
                    <Button
                        variant="subtle"
                        color="red"
                        onClick={confirmClearCart}
                        loading={isClearing}
                    >
                        {t('cartPage.clearAll')}
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
                                                <Iconify icon="tabler:trash" width={18} stroke={1.5} />
                                            </ActionIcon>
                                        </Group>

                                        <Group justify="space-between" align="center">
                                            <Group gap="md">
                                                <Text size="lg" fw={700} c="blue">
                                                    {formatVND(Number(item.product.price))}
                                                </Text>
                                                {item.product.originalPrice && (
                                                    <Text size="sm" td="line-through" c="dimmed">
                                                        {formatVND(Number(item.product.originalPrice))}
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
                                                {t('cartPage.stockRemaining', { count: item.product.stock })}
                                            </Text>
                                            <Text size="md" fw={600}>
                                                {t('cartPage.itemSubtotal')}{' '}
                                                {formatVND(
                                                    Number(item.product.price) * currentQuantity,
                                                )}
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
                        {t('cartPage.orderSummary')}
                    </Title>

                    <Stack gap="sm">
                        <Group justify="space-between">
                            <Text c="dimmed">{t('cartPage.itemCount')}</Text>
                            <Text fw={600}>{liveItemCount} {t('cart.items')}</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text c="dimmed">{t('cartPage.subtotal')}</Text>
                            <Text fw={600}>{formatVND(liveTotalAmount)}</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text c="dimmed">{t('cart.shipping')}:</Text>
                            <Text fw={600}>{t('cartPage.shippingFree')}</Text>
                        </Group>

                        <Divider my="sm" />

                        <Group justify="space-between">
                            <Text size="lg" fw={700}>
                                {t('cart.total')}:
                            </Text>
                            <Text size="xl" fw={800} c="blue">
                                {formatVND(liveTotalAmount)}
                            </Text>
                        </Group>

                        <Button component={Link} href="/checkout" size="lg" fullWidth mt="md">
                            {t('cartPage.checkout')}
                        </Button>

                        <Button component={Link} href="/" variant="light" fullWidth>
                            {t('cartPage.continueShopping')}
                        </Button>
                    </Stack>
                </Paper>
            </Group>
        </Container>
    );
}
