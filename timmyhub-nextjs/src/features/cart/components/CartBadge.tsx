'use client';

import {
    ActionIcon,
    Indicator,
    Popover,
    Stack,
    Text,
    Group,
    Image,
    Button,
    Divider,
    Box,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { formatVND } from '@/utils/currency';
import { useTranslation } from 'react-i18next';

export function CartBadge() {
    const { t } = useTranslation('common');
    const { user } = useAuth();
    const { cart, isLoading } = useCart();
    const router = useRouter();
    const [opened, setOpened] = useState(false);
    const itemCount = cart?.itemCount ?? 0;

    const handleIconClick = () => {
        if (!user) {
            router.push('/login?callbackUrl=/cart');
        }
    };

    const handleLinkClick = () => {
        setOpened(false);
    };

    if (!user) {
        return (
            <Indicator
                label={itemCount}
                size={20}
                disabled={itemCount === 0}
                color="red"
                offset={7}
            >
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={handleIconClick}
                    loading={isLoading}
                >
                    <Iconify icon="solar:cart-3-bold" width={20} />
                </ActionIcon>
            </Indicator>
        );
    }


    const cartItems = cart?.items ?? [];

    return (
        <Popover
            opened={opened}
            onChange={setOpened}
            width={320}
            position="bottom-end"
            offset={8}
            withArrow
            withinPortal={false}
        >
            <Popover.Target>
                <Indicator
                    label={itemCount}
                    size={20}
                    disabled={itemCount === 0}
                    color="red"
                    offset={7}
                >
                    <ActionIcon variant={opened ? 'light' : 'subtle'} size="lg" loading={isLoading} onClick={() => setOpened((o) => !o)}>
                        <Iconify icon="solar:cart-3-bold" width={20} />
                    </ActionIcon>
                </Indicator>
            </Popover.Target>

            <Popover.Dropdown p={0}>
                <Box p="md" pb="xs">
                    <Text size="sm" fw={600} mb="xs">
                        {t('cart.myCart')} ({itemCount} {t('cart.items')})
                    </Text>
                </Box>
                <Divider />

                {cartItems.length === 0 ? (
                    <Stack p="lg" align="center" gap="md">
                        <Text size="sm" c="dimmed">
                            {t('cart.emptyCart')}
                        </Text>
                        <Button
                            component={Link}
                            href="/"
                            variant="light"
                            size="sm"
                            fullWidth
                            onClick={handleLinkClick}
                        >
                            {t('cart.continueShopping')}
                        </Button>
                    </Stack>
                ) : (
                    <>
                        <Stack
                            gap={0}
                            p="xs"
                            style={{
                                maxHeight: 400,
                                overflowY: 'auto',
                                overflowX: 'hidden'
                            }}
                        >
                            {cartItems.map(item => (
                                <Group
                                    key={item.id}
                                    gap="sm"
                                    p="xs"
                                    wrap="nowrap"
                                    style={{ minWidth: 0 }}
                                >
                                    <Image
                                        src={
                                            item.product.images?.[0] ||
                                            '/placeholder-product.jpg'
                                        }
                                        alt={item.product.name}
                                        w={48}
                                        h={48}
                                        fit="cover"
                                        radius="sm"
                                    />
                                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                        <Text
                                            size="xs"
                                            fw={500}
                                            lineClamp={2}
                                            style={{ wordBreak: 'break-word' }}
                                        >
                                            {item.product.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {item.quantity} x{' '}
                                            {formatVND(Number(item.product.price))}
                                        </Text>
                                    </Stack>
                                </Group>
                            ))}
                        </Stack>
                        <Divider />
                        <Group justify="space-between" p="md" wrap="wrap" gap="xs">
                            <Text size="sm" fw={600}>
                                {t('cart.subtotal')}:{' '}
                                {formatVND(cart?.totalAmount ?? 0)}
                            </Text>
                            <Group gap="xs">
                                <Button
                                    component={Link}
                                    href="/cart"
                                    size="sm"
                                    variant="light"
                                    onClick={handleLinkClick}
                                >
                                    {t('cart.myCart')}
                                </Button>
                                <Button
                                    component={Link}
                                    href="/checkout"
                                    size="sm"
                                    variant="filled"
                                    onClick={handleLinkClick}
                                >
                                    {t('cart.checkout')}
                                </Button>
                            </Group>
                        </Group>
                    </>
                )}
            </Popover.Dropdown>
        </Popover>
    );
}
