'use client';

/**
 * Banner gradient + panel trắng: avatar + info + actions + 4 metrics như thiết kế Stitch.
 */
import type { ReactElement } from 'react';
import {
    Avatar,
    Badge,
    Button,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import type { SellerShop } from '@/types/product';
import { SELLER_SHOP_HARDCODED } from '@/constants/seller-shop-ui';
import { formatShopJoinedRelative } from '@/features/sellers/utils/seller-shop-joined';

interface SellerShopHeroProps {
    shop: SellerShop;
    sellerDisplayName: string;
    onChat: () => void;
    onFollow: () => void;
}

export function SellerShopHero({
    shop,
    sellerDisplayName,
    onChat,
    onFollow,
}: SellerShopHeroProps): ReactElement {
    const { t } = useTranslation('common');
    const joinedLabel = formatShopJoinedRelative(shop.createdAt, t);
    const logo = shop.shopLogo ?? shop.user.profile?.avatar ?? null;

    return (
        <div
            suppressHydrationWarning
            className="relative bg-[#f6f7f8] pb-8 dark:bg-[#111a21]"
        >
            {/* Banner gradient */}
            <div className="h-28 bg-linear-to-br from-sky-100 via-blue-100 to-indigo-100 md:h-36 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900" />

            <div className="mx-auto max-w-[var(--mantine-breakpoint-xl)] px-4 md:px-8">
                {/* Panel trắng bao toàn bộ thông tin + metrics */}
                <Paper
                    radius="md"
                    p="xl"
                    className="relative -mt-14 bg-white shadow-lg dark:bg-slate-900"
                >
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        {/* Left: avatar + info */}
                        <Group align="flex-end" gap="lg" wrap="nowrap">
                            <Avatar
                                src={logo}
                                size={100}
                                radius="50%"
                                className="border-4 border-white shadow-md dark:border-slate-800"
                                color="blue"
                            >
                                <Iconify icon="tabler:building-store" width={44} />
                            </Avatar>
                            <Stack gap={4} pb={1} className="min-w-0">
                                <Group gap="sm" wrap="wrap">
                                    <Title order={2} className="text-slate-900 dark:text-slate-100">
                                        {shop.shopName}
                                    </Title>
                                    {shop.isVerified && (
                                        <Badge
                                            color="blue"
                                            variant="light"
                                            size="md"
                                            leftSection={
                                                <ThemeIcon size={14} color="blue" variant="transparent" p={0}>
                                                    <Iconify icon="tabler:shield-check" width={14} />
                                                </ThemeIcon>
                                            }
                                        >
                                            {t('sellerShop.verified')}
                                        </Badge>
                                    )}
                                </Group>
                                <Text size="sm" c="dimmed">
                                    {t('sellerShop.sellerLabelPrefix')} {sellerDisplayName}
                                </Text>
                                <Group gap="xs">
                                    <ThemeIcon size={16} variant="transparent" p={0} color="yellow">
                                        <Iconify icon="tabler:star" width={16} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                                    </ThemeIcon>
                                    <Text size="sm" fw={600} className="text-slate-800 dark:text-slate-200">
                                        {shop.rating.toFixed(1)}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        ({SELLER_SHOP_HARDCODED.reviewsCountDisplay} đánh giá)
                                    </Text>
                                </Group>
                                <Text size="sm" c="dimmed">
                                    {SELLER_SHOP_HARDCODED.followersDisplay}
                                </Text>
                            </Stack>
                        </Group>

                        {/* Right: action buttons */}
                        <Group gap="sm" className="shrink-0 pb-1">
                            <Button
                                leftSection={<Iconify icon="tabler:plus" width={18} />}
                                color="blue"
                                radius="lg"
                                onClick={onFollow}
                            >
                                {t('sellerShop.follow')}
                            </Button>
                            <Button
                                leftSection={<Iconify icon="tabler:message" width={18} />}
                                variant="default"
                                radius="lg"
                                onClick={onChat}
                            >
                                {t('sellerShop.chat')}
                            </Button>
                        </Group>
                    </div>

                    {/* 4 metrics cards */}
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" className="mt-8">
                        <Paper
                            radius="xl"
                            p="md"
                            withBorder
                            className="bg-white dark:bg-slate-800"
                        >
                            <Group gap="sm" wrap="nowrap">
                                <ThemeIcon variant="light" color="blue" size="lg" radius="lg">
                                    <Iconify icon="tabler:package" width={20} />
                                </ThemeIcon>
                                <Stack gap={0}>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {t('sellerShop.metricProducts')}
                                    </Text>
                                    <Text fw={800} size="lg">
                                        {shop.products.length}
                                    </Text>
                                </Stack>
                            </Group>
                        </Paper>
                        <Paper
                            radius="xl"
                            p="md"
                            withBorder
                            className="bg-white dark:bg-slate-800"
                        >
                            <Group gap="sm" wrap="nowrap">
                                <ThemeIcon variant="light" color="teal" size="lg" radius="lg">
                                    <Iconify icon="tabler:message-circle" width={20} />
                                </ThemeIcon>
                                <Stack gap={0}>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {t('sellerShop.metricResponse')}
                                    </Text>
                                    <Text fw={800} size="lg">
                                        {SELLER_SHOP_HARDCODED.responseRatePercent}%
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        ({t('sellerShop.metricResponseHint')})
                                    </Text>
                                </Stack>
                            </Group>
                        </Paper>
                        <Paper
                            radius="xl"
                            p="md"
                            withBorder
                            className="bg-white dark:bg-slate-800"
                        >
                            <Group gap="sm" wrap="nowrap">
                                <ThemeIcon variant="light" color="gray" size="lg" radius="lg">
                                    <Iconify icon="tabler:calendar" width={20} />
                                </ThemeIcon>
                                <Stack gap={0}>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {t('sellerShop.metricJoined')}
                                    </Text>
                                    <Text fw={700} size="sm">
                                        {joinedLabel}
                                    </Text>
                                </Stack>
                            </Group>
                        </Paper>
                        <Paper
                            radius="xl"
                            p="md"
                            withBorder
                            className="bg-white dark:bg-slate-800"
                        >
                            <Group gap="sm" wrap="nowrap">
                                <ThemeIcon variant="light" color="violet" size="lg" radius="lg">
                                    <Iconify icon="tabler:user-plus" width={20} />
                                </ThemeIcon>
                                <Stack gap={0}>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {t('sellerShop.metricFollowing')}
                                    </Text>
                                    <Text fw={800} size="lg">
                                        {SELLER_SHOP_HARDCODED.followingCountDisplay}
                                    </Text>
                                </Stack>
                            </Group>
                        </Paper>
                    </SimpleGrid>
                </Paper>
            </div>
        </div>
    );
}
