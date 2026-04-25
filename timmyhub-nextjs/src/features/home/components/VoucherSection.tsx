'use client';

import { SimpleGrid, Box, Text, Button, Group, Skeleton } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService } from '@/services/voucher.service';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { formatVND } from '@/utils/currency';

interface VoucherDisplay {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderValue?: number;
    description?: string;
    endDate: string;
}

function formatValue(v: VoucherDisplay) {
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

export function VoucherSection() {
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
    const vouchers: VoucherDisplay[] = res?.data || [];

    if (isLoading) return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={100} radius={12} />
            ))}
        </SimpleGrid>
    );
    if (!vouchers.length) return null;

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {vouchers.slice(0, 6).map((v, i) => {
                const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
                const saved = savedIds.has(v.id);

                return (
                    <Box
                        key={v.id}
                        style={{
                            borderRadius: 12,
                            border: `1.5px dashed ${color}22`,
                            background: `${color}08`,
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                        }}
                    >
                        <Group gap={10} align="center">
                            <Box
                                style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: `${color}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Iconify icon="solar:ticket-bold" width={22} color={color} />
                            </Box>
                            <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text fw={700} size="md" style={{ color: '#1c252e' }}>{formatValue(v)}</Text>
                                <Text size="xs" c="dimmed">
                                    {v.minOrderValue ? `Đơn từ ${formatVND(v.minOrderValue)}` : 'Mọi đơn hàng'}
                                </Text>
                            </Box>
                        </Group>

                        <Group justify="space-between" align="center">
                            <Group gap={4}>
                                <Iconify icon="solar:clock-circle-linear" width={13} color="#637381" />
                                <Text size="xs" c="dimmed">{daysLeft(v.endDate)}</Text>
                            </Group>
                            {saved ? (
                                <Button
                                    component={Link}
                                    href="/profile/voucher"
                                    size="xs"
                                    radius={50}
                                    variant="light"
                                    style={{ color, background: `${color}14` }}
                                >
                                    Đã lưu
                                </Button>
                            ) : (
                                <Button
                                    size="xs"
                                    radius={50}
                                    variant="filled"
                                    style={{ background: color, color: '#fff' }}
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            notifications.show({ title: 'Vui lòng đăng nhập', message: '', color: 'yellow' });
                                            return;
                                        }
                                        saveMutation.mutate(v.id);
                                    }}
                                    loading={pendingId === v.id}
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
