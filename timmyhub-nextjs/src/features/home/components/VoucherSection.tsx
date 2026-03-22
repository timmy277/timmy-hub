'use client';

import { SimpleGrid, Paper, Flex, Stack, Text, ThemeIcon, Button, useComputedColorScheme, Loader, Center, Badge, ActionIcon, Tooltip } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { m } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '@/services/voucher.service';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { formatVND } from '@/utils/currency';

dayjs.extend(relativeTime);

interface VoucherDisplay {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderValue?: number;
    description?: string;
    endDate: string;
    campaign?: {
        name: string;
    };
}

// Helper function to format voucher display
function formatVoucherValue(voucher: VoucherDisplay): string {
    switch (voucher.type) {
        case 'PERCENTAGE':
            return `${voucher.value}%`;
        case 'FREE_SHIPPING':
            return 'Miễn phí vận chuyển';
        case 'FIXED_AMOUNT':
            return `${formatVND(voucher.value)}`;
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
    return `Đơn từ ${formatVND(minOrderValue)}`;
}

export function VoucherSection() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';
    const { isAuthenticated } = useAuth();

    // Get saved vouchers to check which ones are already saved
    const { data: savedRes } = useQuery({
        queryKey: ['my-vouchers'],
        queryFn: () => voucherService.getMyVouchers(undefined),
        enabled: isAuthenticated,
    });

    const savedVoucherIds = new Set(savedRes?.data?.map(uv => uv.voucher.id) || []);

    const { data: res, isLoading, error } = useQuery({
        queryKey: ['public-vouchers'],
        queryFn: () => voucherService.getPublicVouchers(),
        staleTime: 5 * 60 * 1000,
    });

    const saveMutation = useMutation({
        mutationFn: (voucherId: string) => voucherService.saveVoucher(voucherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
            notifications.show({
                title: 'Thành công',
                message: 'Đã lưu voucher vào danh sách của bạn',
                color: 'green',
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            notifications.show({
                title: 'Lỗi',
                message: err.response?.data?.message || 'Không thể lưu voucher',
                color: 'red',
            });
        },
    });

    const vouchers: VoucherDisplay[] = res?.data || [];

    const handleSaveVoucher = (voucherId: string, voucherCode: string) => {
        if (!isAuthenticated) {
            notifications.show({
                title: 'Đăng nhập để lưu voucher',
                message: 'Vui lòng đăng nhập để lưu voucher vào danh sách của bạn',
                color: 'yellow',
            });
            return;
        }
        saveMutation.mutate(voucherId);
    };

    if (isLoading) {
        return (
            <Center py="xl">
                <Loader size="sm" />
            </Center>
        );
    }

    if (error || vouchers.length === 0) {
        return null;
    }

    return (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
            {vouchers.slice(0, 6).map((voucher, i) => {
                const color = getVoucherColor(voucher.type, i);
                const isSaved = savedVoucherIds.has(voucher.id);

                return (
                    <Paper key={voucher.id} p="md" radius="md" withBorder
                        bg={isDark ? `${color}.9` : `${color}.0`}
                        style={{
                            borderColor: isDark ? `var(--mantine-color-${color}-8)` : `var(--mantine-color-${color}-3)`,
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        component={m.div}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        whileHover={{ scale: 1.02, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    >
                        <Flex gap="md" align="center">
                            <ThemeIcon size={48} radius="xl" color={color} variant="filled">
                                <Iconify icon="tabler:ticket" width={24} />
                            </ThemeIcon>
                            <Stack gap={2} style={{ flex: 1 }}>
                                <Text fw={700} size="lg" c={isDark ? 'white' : `${color}.9`}>
                                    {t('voucher.discount', 'OFF')} {formatVoucherValue(voucher)}
                                </Text>
                                <Flex align="center" gap={4}>
                                    <Text size="xs" c={isDark ? 'dimmed' : 'dimmed'}>
                                        {getMinOrderText(voucher.minOrderValue)}
                                    </Text>
                                </Flex>
                                <Flex align="center" gap={4}>
                                    <Iconify icon="tabler:clock" width={12} color={isDark ? `var(--mantine-color-${color}-2)` : `var(--mantine-color-${color}-7)`} />
                                    <Text size="xs" c={isDark ? `${color}.2` : `${color}.7`} fw={600}>
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
                        {isSaved ? (
                            <Button
                                size="xs"
                                radius="xl"
                                variant="light"
                                color={color}
                                mt="sm"
                                fullWidth
                                component={Link}
                                href="/profile/voucher"
                                leftSection={<Iconify icon="tabler:heart-filled" width={14} />}
                            >
                                Đã lưu
                            </Button>
                        ) : (
                            <Button
                                size="xs"
                                radius="xl"
                                variant="white"
                                color={color}
                                mt="sm"
                                fullWidth
                                leftSection={<Iconify icon="tabler:heart" width={14} />}
                                onClick={() => handleSaveVoucher(voucher.id, voucher.code)}
                                loading={saveMutation.isPending}
                            >
                                Lưu voucher
                            </Button>
                        )}
                    </Paper>
                );
            })}
        </SimpleGrid>
    );
}
