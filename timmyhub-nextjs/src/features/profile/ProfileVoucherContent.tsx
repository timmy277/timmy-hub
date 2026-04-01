'use client';

import {
    Box,
    Flex,
    Stack,
    Text,
    ThemeIcon,
    Button,
    Tabs,
    Loader,
    Center,
    Badge,
    Group,
    ActionIcon,
    Paper,
    useComputedColorScheme,
    CopyButton,
    Tooltip,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService, UserVoucher as UserVoucherType } from '@/services/voucher.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import Link from 'next/link';
import { QUERY_KEYS } from '@/constants';
import Iconify from '@/components/iconify/Iconify';
import { formatVND } from '@/utils/currency';
import { useTranslation } from 'react-i18next';

dayjs.extend(relativeTime);

type VoucherStatus = 'SAVED' | 'USED' | 'EXPIRED' | 'ALL';

function formatVoucherValue(voucher: { type: string; value: number }, t?: (key: string) => string): string {
    switch (voucher.type) {
        case 'PERCENTAGE':
            return `${voucher.value}%`;
        case 'FREE_SHIPPING':
            return t ? t('common.freeShipping2') : 'Miễn phí vận chuyển';
        case 'FIXED_AMOUNT':
            return `${formatVND(voucher.value)}`;
        default:
            return `${voucher.value}`;
    }
}

function getTimeRemaining(endDate: string, t?: (key: string, opts?: Record<string, unknown>) => string): string {
    const now = dayjs();
    const end = dayjs(endDate);
    const diff = end.diff(now, 'day');

    if (diff < 0) return t ? t('common.expired2') : 'Đã hết hạn';
    if (diff === 0) return t ? t('common.expiryToday') : 'Hết hạn trong ngày';
    if (diff === 1) return t ? t('common.oneDayLeft') : 'Còn 1 ngày';
    if (diff <= 7) return t ? t('common.daysLeft', { count: diff }) : `Còn ${diff} ngày`;
    return end.format('DD/MM');
}

function getVoucherColor(type: string, index: number): string {
    const colors = ['teal', 'blue', 'orange', 'violet', 'cyan', 'pink'];
    return colors[index % colors.length];
}

function getMinOrderText(minOrderValue?: number, t?: (key: string, opts?: Record<string, unknown>) => string): string {
    if (!minOrderValue) return t ? t('common.anyOrder') : 'Mọi đơn hàng';
    return t ? `${t('common.minOrder')} ${formatVND(minOrderValue)}` : `Đơn từ ${formatVND(minOrderValue)}`;
}

function VoucherCard({
    userVoucher,
    onRemove,
    index,
}: {
    userVoucher: UserVoucherType;
    onRemove: () => void;
    index: number;
}) {
    const { t } = useTranslation('common');
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';
    const voucher = userVoucher.voucher;
    const color = getVoucherColor(voucher.type, index);
    const status = userVoucher.status as VoucherStatus;
    const isExpired = status === 'EXPIRED' || dayjs(voucher.endDate).isBefore(dayjs());

    return (
        <Paper
            p="md"
            radius="md"
            withBorder
            bg={isDark ? `${color}.9` : `${color}.0`}
            style={{
                borderColor: isDark ? `var(--mantine-color-${color}-8)` : `var(--mantine-color-${color}-3)`,
                opacity: isExpired ? 0.6 : 1,
            }}
        >
            <Flex gap="md" align="center">
                <ThemeIcon size={48} radius="xl" color={color} variant="filled">
                    <Iconify icon="mdi:ticket" size={24} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between">
                        <Text fw={700} size="lg" c={isDark ? 'white' : `${color}.9`}>
                            {t('profileVoucher.discountLabel')} {formatVoucherValue(voucher, t)}
                        </Text>
                        <Badge
                            color={
                                status === 'SAVED' ? 'green' : status === 'USED' ? 'blue' : 'red'
                            }
                            variant="light"
                        >
                            {status === 'SAVED' ? t('profileVoucher.statusSaved') : status === 'USED' ? t('profileVoucher.statusUsed') : t('profileVoucher.statusExpired')}
                        </Badge>
                    </Group>
                    <Flex align="center" gap={4}>
                        <Text size="xs" c="dimmed">
                            {getMinOrderText(voucher.minOrderValue, t)}
                        </Text>
                    </Flex>
                    <Flex align="center" gap={4}>
                        <Iconify icon="mdi:clock" size={12} />
                        <Text
                            size="xs"
                            c={isExpired ? 'red' : isDark ? `${color}.2` : `${color}.7`}
                            fw={600}
                        >
                            {t('profileVoucher.expiryLabel')} {getTimeRemaining(voucher.endDate, t)}
                        </Text>
                    </Flex>
                    {voucher.campaign && (
                        <Badge size="xs" variant="light" color={color}>
                            {voucher.campaign.name}
                        </Badge>
                    )}
                </Stack>
            </Flex>
            {voucher.description && (
                <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
                    {voucher.description}
                </Text>
            )}
            <Group mt="sm" gap="xs">
                <CopyButton value={voucher.code} timeout={2000}>
                    {({ copied, copy }) => (
                        <Button
                            size="xs"
                            radius="xl"
                            variant="light"
                            color={color}
                            leftSection={copied ? <Iconify icon="mdi:check" size={14} /> : <Iconify icon="mdi:copy" size={14} />}
                            onClick={copy}
                        >
                            {copied ? t('profileVoucher.copied') : voucher.code}
                        </Button>
                    )}
                </CopyButton>
                {status === 'SAVED' && !isExpired && (
                    <Tooltip label={t('profileVoucher.removeTooltip')}>
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={onRemove}
                        >
                            <Iconify icon="mdi:trash-can" size={14} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Paper>
    );
}

export function ProfileVoucherContent() {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<VoucherStatus | null>('ALL');

    const { data: res, isLoading } = useQuery({
        queryKey: QUERY_KEYS.MY_VOUCHERS,
        queryFn: () => voucherService.getMyVouchers(undefined),
    });

    const removeMutation = useMutation({
        mutationFn: (voucherId: string) => voucherService.removeSavedVoucher(voucherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_VOUCHERS });
        },
    });

    const allUserVouchers: UserVoucherType[] = res?.data || [];

    const userVouchers = activeTab && activeTab !== 'ALL'
        ? allUserVouchers.filter((v) => v.status === activeTab)
        : allUserVouchers;

    const counts = {
        ALL: allUserVouchers.length,
        SAVED: allUserVouchers.filter((v) => v.status === 'SAVED').length,
        USED: allUserVouchers.filter((v) => v.status === 'USED').length,
        EXPIRED: allUserVouchers.filter((v) => v.status === 'EXPIRED').length,
    };

    const handleRemove = (voucherId: string) => {
        removeMutation.mutate(voucherId);
    };

    return (
        <Box>
            <Flex justify="space-between" align="center" mb="md">
                <Text fw={600} size="lg">{t('profileVoucher.title')}</Text>
                <Button
                    component={Link}
                    href="/"
                    size="xs"
                    variant="light"
                >
                    {t('profileVoucher.discoverMore')}
                </Button>
            </Flex>

            <Tabs value={activeTab} onChange={(v) => setActiveTab(v as VoucherStatus)}>
                <Tabs.List>
                    <Tabs.Tab value="ALL">
                        {t('profileVoucher.tabAll', { count: counts.ALL })}
                    </Tabs.Tab>
                    <Tabs.Tab value="SAVED">
                        {t('profileVoucher.tabSaved', { count: counts.SAVED })}
                    </Tabs.Tab>
                    <Tabs.Tab value="USED">
                        {t('profileVoucher.tabUsed', { count: counts.USED })}
                    </Tabs.Tab>
                    <Tabs.Tab value="EXPIRED">
                        {t('profileVoucher.tabExpired', { count: counts.EXPIRED })}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={activeTab || 'ALL'} pt="md">
                    {isLoading ? (
                        <Center py="xl">
                            <Loader size="sm" />
                        </Center>
                    ) : userVouchers.length === 0 ? (
                        <Stack align="center" py="xl" gap="md">
                            <ThemeIcon size={64} radius="xl" color="gray" variant="light">
                                <Iconify icon="mdi:ticket" size={32} />
                            </ThemeIcon>
                            <Text c="dimmed" ta="center">
                                {activeTab === 'ALL'
                                    ? t('profileVoucher.emptyAll')
                                    : activeTab === 'SAVED'
                                        ? t('profileVoucher.emptySaved')
                                        : activeTab === 'USED'
                                            ? t('profileVoucher.emptyUsed')
                                            : t('profileVoucher.emptyExpired')}
                            </Text>
                            <Button
                                component={Link}
                                href="/"
                                variant="light"
                                leftSection={<Iconify icon="mdi:ticket" size={16} />}
                            >
                                {t('profileVoucher.discoverNow')}
                            </Button>
                        </Stack>
                    ) : (
                        <Stack gap="md">
                            {userVouchers.map((uv, index) => (
                                <VoucherCard
                                    key={uv.id}
                                    userVoucher={uv}
                                    index={index}
                                    onRemove={() => handleRemove(uv.voucher.id)}
                                />
                            ))}
                        </Stack>
                    )}
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
