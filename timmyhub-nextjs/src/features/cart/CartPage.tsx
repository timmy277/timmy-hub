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
    Checkbox,
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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Khi cart load xong, mặc định chọn tất cả
    const allIds = cart?.items.map(i => i.id) ?? [];
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    const someSelected = allIds.some(id => selectedIds.has(id));

    const toggleItem = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelectedIds(allSelected ? new Set() : new Set(allIds));
    };

    // Init select all khi cart load
    const [initialized, setInitialized] = useState(false);
    if (cart && !initialized) {
        setSelectedIds(new Set(cart.items.map(i => i.id)));
        setInitialized(true);
    }

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

    const selectedItems = cart.items.filter(i => selectedIds.has(i.id));

    const liveItemCount = selectedItems.reduce(
        (sum, item) => sum + (quantities[item.id] ?? item.quantity),
        0,
    );
    const liveTotalAmount = selectedItems.reduce(
        (sum, item) =>
            sum + Number(item.product.price) * (quantities[item.id] ?? item.quantity),
        0,
    );

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <Group gap="md">
                    <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={toggleAll}
                        label={<Text fw={600}>{t('cartPage.yourCart')}</Text>}
                        size="md"
                    />
                    <Text c="dimmed" size="sm">({cart.items.length} {t('cart.items')})</Text>
                </Group>
                {cart.items.length > 0 && (
                    <Button variant="subtle" color="red" onClick={confirmClearCart} loading={isClearing}>
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
                            <Paper key={item.id} p="md" withBorder
                                style={{ opacity: selectedIds.has(item.id) ? 1 : 0.5, transition: 'opacity 0.15s' }}
                            >
                                <Group align="center" gap="md">
                                    <Checkbox
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => toggleItem(item.id)}
                                    />
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

                        <Button
                            component={Link}
                            href={`/checkout?items=${[...selectedIds].join(',')}`}
                            size="lg"
                            fullWidth
                            mt="md"
                            disabled={selectedIds.size === 0}
                        >
                            {t('cartPage.checkout')} {selectedIds.size > 0 && `(${selectedIds.size})`}
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
