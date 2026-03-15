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
import { IconTicket, IconClock, IconCopy, IconCheck, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService, UserVoucher as UserVoucherType } from '@/services/voucher.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import Link from 'next/link';
import { QUERY_KEYS } from '@/constants';

dayjs.extend(relativeTime);

type VoucherStatus = 'SAVED' | 'USED' | 'EXPIRED' | 'ALL';

function formatVoucherValue(voucher: { type: string; value: number }): string {
    switch (voucher.type) {
        case 'PERCENTAGE':
            return `${voucher.value}%`;
        case 'FREE_SHIPPING':
            return 'Miễn phí vận chuyển';
        case 'FIXED_AMOUNT':
            return `${voucher.value.toLocaleString()}đ`;
        default:
            return `${voucher.value}`;
    }
}

function getTimeRemaining(endDate: string): string {
    const now = dayjs();
    const end = dayjs(endDate);
    const diff = end.diff(now, 'day');

    if (diff < 0) return 'Đã hết hạn';
    if (diff === 0) return 'Hết hạn trong ngày';
    if (diff === 1) return 'Còn 1 ngày';
    if (diff <= 7) return `Còn ${diff} ngày`;
    return end.format('DD/MM');
}

function getVoucherColor(type: string, index: number): string {
    const colors = ['teal', 'blue', 'orange', 'violet', 'cyan', 'pink'];
    return colors[index % colors.length];
}

function getMinOrderText(minOrderValue?: number): string {
    if (!minOrderValue) return 'Mọi đơn hàng';
    return `Đơn từ ${minOrderValue.toLocaleString()}đ`;
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
                    <IconTicket size={24} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                    <Group justify="space-between">
                        <Text fw={700} size="lg" c={isDark ? 'white' : `${color}.9`}>
                            GIẢM {formatVoucherValue(voucher)}
                        </Text>
                        <Badge
                            color={
                                status === 'SAVED' ? 'green' : status === 'USED' ? 'blue' : 'red'
                            }
                            variant="light"
                        >
                            {status === 'SAVED' ? 'Còn dùng được' : status === 'USED' ? 'Đã dùng' : 'Hết hạn'}
                        </Badge>
                    </Group>
                    <Flex align="center" gap={4}>
                        <Text size="xs" c="dimmed">
                            {getMinOrderText(voucher.minOrderValue)}
                        </Text>
                    </Flex>
                    <Flex align="center" gap={4}>
                        <IconClock
                            size={12}
                            color={
                                isExpired
                                    ? 'var(--mantine-color-red-6)'
                                    : isDark
                                        ? `var(--mantine-color-${color}-2)`
                                        : `var(--mantine-color-${color}-7)`
                            }
                        />
                        <Text
                            size="xs"
                            c={isExpired ? 'red' : isDark ? `${color}.2` : `${color}.7`}
                            fw={600}
                        >
                            HSD: {getTimeRemaining(voucher.endDate)}
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
                            leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            onClick={copy}
                        >
                            {copied ? 'Đã copy' : voucher.code}
                        </Button>
                    )}
                </CopyButton>
                {status === 'SAVED' && !isExpired && (
                    <Tooltip label="Xóa khỏi danh sách">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={onRemove}
                        >
                            <IconTrash size={14} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Paper>
    );
}

export function ProfileVoucherContent() {
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
                <Text fw={600} size="lg">Voucher của tôi</Text>
                <Button
                    component={Link}
                    href="/"
                    size="xs"
                    variant="light"
                >
                    Khám phá thêm voucher
                </Button>
            </Flex>

            <Tabs value={activeTab} onChange={(v) => setActiveTab(v as VoucherStatus)}>
                <Tabs.List>
                    <Tabs.Tab value="ALL">
                        Tất cả ({counts.ALL})
                    </Tabs.Tab>
                    <Tabs.Tab value="SAVED">
                        Có thể dùng ({counts.SAVED})
                    </Tabs.Tab>
                    <Tabs.Tab value="USED">
                        Đã dùng ({counts.USED})
                    </Tabs.Tab>
                    <Tabs.Tab value="EXPIRED">
                        Hết hạn ({counts.EXPIRED})
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
                                <IconTicket size={32} />
                            </ThemeIcon>
                            <Text c="dimmed" ta="center">
                                {activeTab === 'ALL'
                                    ? 'Bạn chưa lưu voucher nào'
                                    : activeTab === 'SAVED'
                                        ? 'Bạn không có voucher nào có thể dùng'
                                        : activeTab === 'USED'
                                            ? 'Bạn chưa dùng voucher nào'
                                            : 'Bạn không có voucher nào hết hạn'}
                            </Text>
                            <Button
                                component={Link}
                                href="/"
                                variant="light"
                                leftSection={<IconTicket size={16} />}
                            >
                                Khám phá voucher ngay
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