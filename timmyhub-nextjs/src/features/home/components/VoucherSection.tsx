'use client';

import { SimpleGrid, Box, Text, Button, Group, Skeleton } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService, type Voucher } from '@/services/voucher.service';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { formatVND } from '@/utils/currency';
import { memo } from 'react';

interface VoucherSectionProps {
    initialVouchers: Voucher[];
}

function formatValue(v: Voucher) {
    if (v.type === 'PERCENTAGE') return `Giảm ${v.value}%`;
    if (v.type === 'FREE_SHIPPING') return 'Miễn phí vận chuyển';
    return `Giảm ${formatVND(v.value)}`;
}

function daysLeft(endDate: string) {
    const d = dayjs(endDate).diff(dayjs(), 'day');
    if (d < 0) return 'Hết hạn';
    if (d === 0) return 'Hết hạn hôm nay';
    return `Còn ${d} ngày`;
}

const ACCENT_COLORS = ['#00a76f', '#0c68e9', '#ff5630', '#7635dc', '#00b8d9', '#ffab00'];

function VoucherSectionComponent({ initialVouchers }: VoucherSectionProps) {
    const qc = useQueryClient();
    const { isAuthenticated } = useAuth();

    const { data: savedRes } = useQuery({
        queryKey: ['my-vouchers'],
        queryFn: () => voucherService.getMyVouchers(undefined),
        enabled: isAuthenticated,
    });
    const savedIds = new Set(savedRes?.data?.map(uv => uv.voucher.id) || []);

    const { data: res, isLoading } = useQuery({
        queryKey: ['public-vouchers'],
        queryFn: () => voucherService.getPublicVouchers(),
        initialData: initialVouchers.length > 0 ? {
            success: true,
            data: initialVouchers,
            message: 'Initial vouchers from SSR',
            timestamp: new Date().toISOString()
        } : undefined,
        staleTime: 5 * 60 * 1000,
    });

    const saveMutation = useMutation({
        mutationFn: (id: string) => voucherService.saveVoucher(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['my-vouchers'] });
            notifications.show({ title: 'Đã lưu voucher', message: '', color: 'green' });
        },
        onError: (err: unknown) => {
            const e = err as { response?: { data?: { message?: string } } };
            notifications.show({ title: 'Lỗi', message: e.response?.data?.message || '', color: 'red' });
        },
    });

    const pendingId = saveMutation.isPending ? saveMutation.variables : null;
    const vouchers: Voucher[] = res?.data || [];

    if (isLoading) return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" aria-label="Đang tải voucher" suppressHydrationWarning>
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={140} radius={12} />
            ))}
        </SimpleGrid>
    );
    if (!vouchers.length) return null;

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" component="section" aria-label="Voucher khuyến mãi" suppressHydrationWarning>
            {vouchers.slice(0, 6).map((v, i) => {
                const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
                const saved = savedIds.has(v.id);

                return (
                    <Box
                        key={v.id}
                        style={{
                            borderRadius: 12,
                            border: `2px dashed ${color}`,
                            background: `${color}08`,
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                            transition: 'all 150ms ease',
                            cursor: 'default',
                        }}
                        role="article"
                        aria-label={`Voucher ${formatValue(v)}`}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.12)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0px 1px 3px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Group gap={12} align="center">
                            <Box
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: `${color}18`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                                aria-hidden="true"
                            >
                                <Iconify icon="solar:ticket-bold" width={24} color={color} />
                            </Box>
                            <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                    fw={700}
                                    size="lg"
                                    style={{
                                        color: '#1c252e',
                                        fontFamily: 'Public Sans Variable, sans-serif',
                                        fontSize: 19,
                                    }}
                                >
                                    {formatValue(v)}
                                </Text>
                                <Text
                                    size="sm"
                                    style={{
                                        color: '#637381',
                                        fontFamily: 'Public Sans Variable, sans-serif',
                                        fontSize: 14,
                                    }}
                                >
                                    {v.minOrderValue ? `Đơn từ ${formatVND(v.minOrderValue)}` : 'Mọi đơn hàng'}
                                </Text>
                            </Box>
                        </Group>

                        <Group justify="space-between" align="center">
                            <Group gap={6}>
                                <Iconify icon="solar:clock-circle-linear" width={14} color="#637381" aria-hidden="true" />
                                <Text
                                    size="sm"
                                    style={{
                                        color: '#637381',
                                        fontFamily: 'Public Sans Variable, sans-serif',
                                        fontSize: 12,
                                    }}
                                >
                                    {daysLeft(v.endDate)}
                                </Text>
                            </Group>
                            {saved ? (
                                <Button
                                    component={Link}
                                    href="/profile/voucher"
                                    size="sm"
                                    radius={8}
                                    variant="light"
                                    style={{
                                        color,
                                        background: `${color}14`,
                                        fontFamily: 'Public Sans Variable, sans-serif',
                                        fontWeight: 600,
                                        fontSize: 14,
                                    }}
                                    aria-label="Đã lưu voucher, xem trong tài khoản"
                                >
                                    Đã lưu
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    radius={8}
                                    variant="filled"
                                    style={{
                                        background: color,
                                        color: '#fff',
                                        fontFamily: 'Public Sans Variable, sans-serif',
                                        fontWeight: 400,
                                        fontSize: 14,
                                        boxShadow: `${color}40 0px 4px 12px 0px`,
                                    }}
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            notifications.show({ title: 'Vui lòng đăng nhập', message: '', color: 'yellow' });
                                            return;
                                        }
                                        saveMutation.mutate(v.id);
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                    loading={pendingId === v.id}
                                    aria-label={`Lưu voucher ${formatValue(v)}`}
                                >
                                    Lưu
                                </Button>
                            )}
                        </Group>
                    </Box>
                );
            })}
        </SimpleGrid>
    );
}

export const VoucherSection = memo(VoucherSectionComponent);
