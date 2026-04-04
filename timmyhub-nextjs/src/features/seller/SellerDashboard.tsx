'use client';

import {
    Title, Text, Container, Paper, Stack, Group, Badge,
    SimpleGrid, Alert, Avatar, ThemeIcon,
    Skeleton, Box, Table, Progress,
    ActionIcon, Tooltip, Select,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { sellerService } from '@/services/seller.service';
import { orderService } from '@/services/order.service';
import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants';
import { useTranslation } from 'react-i18next';
import { formatVND } from '@/utils/currency';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    Legend, ResponsiveContainer,
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLOR_HEX: Record<string, string> = {
    PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#6366f1',
    PACKED: '#06b6d4', SHIPPING: '#14b8a6', DELIVERED: '#22c55e',
    COMPLETED: '#16a34a', CANCELLED: '#ef4444', RETURN_REQUESTED: '#f97316',
    RETURNED: '#fb923c', REFUNDED: '#9ca3af',
};

const STATUS_COLOR_MANTINE: Record<string, string> = {
    PENDING: 'yellow', CONFIRMED: 'blue', PROCESSING: 'indigo',
    PACKED: 'cyan', SHIPPING: 'teal', DELIVERED: 'green',
    COMPLETED: 'green', CANCELLED: 'red', RETURN_REQUESTED: 'orange',
    RETURNED: 'orange', REFUNDED: 'gray',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color, loading }: {
    icon: string; label: string; value: string; sub?: string; color: string; loading?: boolean;
}) {
    return (
        <Paper withBorder p="lg" radius="md">
            <Group justify="space-between" align="flex-start">
                <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>{label}</Text>
                    {loading ? <Skeleton h={28} w={120} /> : <Text size="xl" fw={800}>{value}</Text>}
                    {sub && !loading && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
                </Box>
                <ThemeIcon size={44} radius="md" variant="light" color={color}>
                    <Iconify icon={icon} width={22} />
                </ThemeIcon>
            </Group>
        </Paper>
    );
}

function ChartHeader({ icon, color, title }: { icon: string; color: string; title: string }) {
    return (
        <Group gap="xs" mb="md">
            <ThemeIcon size={28} radius="sm" variant="light" color={color}>
                <Iconify icon={icon} width={16} />
            </ThemeIcon>
            <Text fw={700}>{title}</Text>
        </Group>
    );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function SellerDashboard() {
    const { t } = useTranslation('common');
    const [range, setRange] = useState<string>('30');

    const { data: checkRes } = useQuery({
        queryKey: QUERY_KEYS.SELLER_PROFILE_CHECK,
        queryFn: () => sellerService.checkProfile(),
    });
    const { data: profileRes } = useQuery({
        queryKey: QUERY_KEYS.SELLER_PROFILE,
        queryFn: () => sellerService.getProfile(),
        enabled: checkRes?.data?.status === 'APPROVED',
    });

    const shop = profileRes?.data ?? checkRes?.data?.profile;
    const status = checkRes?.data?.status;
    const isPending = status === 'PENDING';
    const isApproved = status === 'APPROVED';

    const { data: ordersRes, isLoading: ordersLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: () => orderService.getMyOrders(),
        enabled: isApproved,
    });

    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: ['seller-products-mine'],
        queryFn: () => productService.getSellerProducts(),
        enabled: isApproved,
    });

    const orders: Order[] = ordersRes?.data ?? [];
    const products: Product[] = productsRes?.data ?? [];
    const isLoading = ordersLoading || productsLoading;

    // ── Stats ────────────────────────────────────────────────────────────────
    const now = dayjs();
    const rangeNum = parseInt(range);

    const ordersInRange = orders.filter(o =>
        dayjs(o.createdAt).isAfter(now.subtract(rangeNum, 'day'))
    );
    const ordersThisMonth = orders.filter(o =>
        dayjs(o.createdAt).isAfter(now.startOf('month'))
    );
    const ordersToday = orders.filter(o =>
        dayjs(o.createdAt).isAfter(now.startOf('day'))
    );

    const calcRevenue = (list: Order[]) =>
        list.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status))
            .reduce((s, o) => s + Number(o.totalAmount), 0);

    const revenueInRange = calcRevenue(ordersInRange);
    const revenueThisMonth = calcRevenue(ordersThisMonth);
    const revenueToday = calcRevenue(ordersToday);
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const processingOrders = orders.filter(o =>
        ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPING'].includes(o.status)
    ).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // ── Chart data: doanh thu theo ngày (line/area) ──────────────────────────
    const revenueByDay = (() => {
        const map: Record<string, { revenue: number; orders: number }> = {};
        for (let i = rangeNum - 1; i >= 0; i--) {
            const d = now.subtract(i, 'day').format('DD/MM');
            map[d] = { revenue: 0, orders: 0 };
        }
        ordersInRange.forEach(o => {
            const d = dayjs(o.createdAt).format('DD/MM');
            if (map[d]) {
                map[d].orders += 1;
                if (['COMPLETED', 'DELIVERED'].includes(o.status)) {
                    map[d].revenue += Number(o.totalAmount);
                }
            }
        });
        return Object.entries(map).map(([date, v]) => ({ date, ...v }));
    })();

    // ── Chart data: pie trạng thái đơn ──────────────────────────────────────
    const pieData = Object.entries(
        ordersInRange.reduce<Record<string, number>>((acc, o) => {
            acc[o.status] = (acc[o.status] ?? 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value, color: STATUS_COLOR_HEX[name] ?? '#9ca3af' }));

    // ── Chart data: bar top sản phẩm ────────────────────────────────────────
    const topProducts = [...products]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 6);

    const barData = topProducts.map(p => ({
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
        'Đã bán': p.soldCount,
        'Tồn kho': p.stock,
    }));

    // ── Low stock ────────────────────────────────────────────────────────────
    const lowStockProducts = products
        .filter(p => p.stock <= 10 && p.stock > 0)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

    const recentOrders = [...orders]
        .sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix())
        .slice(0, 8);

    const totalInRange = ordersInRange.length || 1;
    const statusBreakdown = Object.entries(
        ordersInRange.reduce<Record<string, number>>((acc, o) => {
            acc[o.status] = (acc[o.status] ?? 0) + 1;
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]);

    return (
        <Container fluid p="md">
            <Stack gap="xl">
                {isPending && (
                    <Alert icon={<Iconify icon="solar:info-circle-bold" width={20} />}
                        title={t('seller.pendingApproval')} color="blue" variant="light">
                        {t('seller.pendingApprovalMessage')}
                    </Alert>
                )}

                {/* Header */}
                <Group justify="space-between" align="flex-end">
                    <Box>
                        <Title order={2}>{t('seller.dashboard')}</Title>
                        <Text c="dimmed" size="sm" mt={2}>
                            {shop?.shopName ?? ''}
                            {shop?.isVerified && (
                                <Badge ml="xs" size="xs" color="blue" variant="light"
                                    leftSection={<Iconify icon="solar:verified-check-bold" width={10} />}>
                                    Verified
                                </Badge>
                            )}
                        </Text>
                    </Box>
                    <Select size="xs" w={140} value={range} onChange={v => setRange(v ?? '30')}
                        data={[
                            { value: '7', label: '7 ngày qua' },
                            { value: '30', label: '30 ngày qua' },
                            { value: '90', label: '90 ngày qua' },
                        ]}
                        leftSection={<Iconify icon="solar:calendar-bold" width={14} />}
                    />
                </Group>

                {/* Stat cards */}
                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                    <StatCard icon="solar:wallet-money-bold" label={`Doanh thu ${range} ngày`}
                        value={formatVND(revenueInRange)} sub={`Hôm nay: ${formatVND(revenueToday)}`}
                        color="green" loading={isLoading} />
                    <StatCard icon="solar:bag-smile-bold" label="Doanh thu tháng này"
                        value={formatVND(revenueThisMonth)} sub={`${ordersThisMonth.length} đơn`}
                        color="blue" loading={isLoading} />
                    <StatCard icon="solar:box-bold" label="Đơn chờ xử lý"
                        value={String(pendingOrders)} sub={`${processingOrders} đang giao`}
                        color="orange" loading={isLoading} />
                    <StatCard icon="solar:shop-bold" label="Tổng sản phẩm"
                        value={String(products.length)}
                        sub={outOfStockCount > 0 ? `${outOfStockCount} hết hàng` : 'Tất cả còn hàng'}
                        color={outOfStockCount > 0 ? 'red' : 'teal'} loading={isLoading} />
                </SimpleGrid>

                {/* Area chart: doanh thu theo ngày */}
                <Paper withBorder p="lg" radius="md">
                    <ChartHeader icon="solar:graph-up-bold" color="blue" title={`Doanh thu & Đơn hàng (${rangeNum} ngày)`} />
                    {isLoading ? <Skeleton h={260} radius="sm" /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueByDay} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={rangeNum > 30 ? 6 : rangeNum > 14 ? 2 : 0} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }}
                                    tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                <RTooltip
                                    formatter={(value: number, name: string) =>
                                        name === 'revenue' ? [formatVND(value), 'Doanh thu'] : [value, 'Đơn hàng']
                                    }
                                />
                                <Legend formatter={v => v === 'revenue' ? 'Doanh thu' : 'Đơn hàng'} />
                                <Area yAxisId="left" type="monotone" dataKey="revenue"
                                    stroke="#3b82f6" strokeWidth={2} fill="url(#gradRevenue)" />
                                <Area yAxisId="right" type="monotone" dataKey="orders"
                                    stroke="#22c55e" strokeWidth={2} fill="url(#gradOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </Paper>

                {/* Bar chart + Pie chart */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    {/* Bar: top sản phẩm */}
                    <Paper withBorder p="lg" radius="md">
                        <ChartHeader icon="solar:chart-bold" color="orange" title="Top sản phẩm bán chạy" />
                        {isLoading ? <Skeleton h={240} radius="sm" /> : barData.length === 0 ? (
                            <Text c="dimmed" size="sm" ta="center" py="xl">Chưa có dữ liệu</Text>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <RTooltip />
                                    <Legend />
                                    <Bar dataKey="Đã bán" fill="#f97316" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Tồn kho" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>

                    {/* Pie: trạng thái đơn */}
                    <Paper withBorder p="lg" radius="md">
                        <ChartHeader icon="solar:pie-chart-2-bold" color="violet" title={`Trạng thái đơn (${rangeNum} ngày)`} />
                        {isLoading ? <Skeleton h={240} radius="sm" /> : pieData.length === 0 ? (
                            <Text c="dimmed" size="sm" ta="center" py="xl">Chưa có đơn hàng</Text>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                        paddingAngle={3} dataKey="value" label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}>
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </SimpleGrid>

                {/* Recent orders + Low stock */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Paper withBorder p="lg" radius="md">
                        <Group justify="space-between" mb="md">
                            <ChartHeader icon="solar:clipboard-list-bold" color="blue" title="Đơn hàng gần đây" />
                            <Tooltip label="Xem tất cả">
                                <ActionIcon component={Link} href="/seller/orders" variant="subtle" size="sm">
                                    <Iconify icon="solar:arrow-right-bold" width={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        {isLoading ? <Stack gap="xs">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={36} />)}</Stack>
                            : recentOrders.length === 0 ? <Text c="dimmed" size="sm" ta="center" py="md">Chưa có đơn hàng</Text>
                                : (
                                    <Table verticalSpacing="xs" fz="sm">
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Mã đơn</Table.Th>
                                                <Table.Th>Trạng thái</Table.Th>
                                                <Table.Th ta="right">Tổng tiền</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {recentOrders.map(o => (
                                                <Table.Tr key={o.id}>
                                                    <Table.Td>
                                                        <Text size="xs" fw={600}>#{o.id.slice(-6).toUpperCase()}</Text>
                                                        <Text size="xs" c="dimmed">{dayjs(o.createdAt).format('DD/MM HH:mm')}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge size="xs" color={STATUS_COLOR_MANTINE[o.status] ?? 'gray'} variant="light">
                                                            {o.status}
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td ta="right">
                                                        <Text size="sm" fw={600}>{formatVND(Number(o.totalAmount))}</Text>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                )}
                    </Paper>

                    <Paper withBorder p="lg" radius="md">
                        <Group justify="space-between" mb="md">
                            <Group gap="xs">
                                <ThemeIcon size={28} radius="sm" variant="light" color="red">
                                    <Iconify icon="solar:danger-triangle-bold" width={16} />
                                </ThemeIcon>
                                <Text fw={700}>Sắp hết hàng</Text>
                                {outOfStockCount > 0 && <Badge size="xs" color="red">{outOfStockCount} hết hàng</Badge>}
                            </Group>
                            <Tooltip label="Quản lý sản phẩm">
                                <ActionIcon component={Link} href="/seller/products" variant="subtle" size="sm">
                                    <Iconify icon="solar:arrow-right-bold" width={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        {isLoading ? <Stack gap="xs">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={40} />)}</Stack>
                            : lowStockProducts.length === 0 ? (
                                <Group gap="xs" py="md" justify="center">
                                    <Iconify icon="solar:check-circle-bold" width={20} color="var(--mantine-color-green-6)" />
                                    <Text c="dimmed" size="sm">Tất cả sản phẩm còn hàng</Text>
                                </Group>
                            ) : (
                                <Stack gap="sm">
                                    {lowStockProducts.map(p => (
                                        <Group key={p.id} justify="space-between" wrap="nowrap">
                                            <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                                <Avatar src={p.images?.[0]} size={36} radius="sm" color="red">
                                                    <Iconify icon="solar:box-bold" width={18} />
                                                </Avatar>
                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Text size="sm" fw={500} truncate="end">{p.name}</Text>
                                                    <Progress value={Math.min(p.stock / 10 * 100, 100)}
                                                        color={p.stock <= 3 ? 'red' : 'orange'} size="xs" mt={4} />
                                                </Box>
                                            </Group>
                                            <Badge size="sm" color={p.stock <= 3 ? 'red' : 'orange'} variant="light">
                                                {p.stock} còn
                                            </Badge>
                                        </Group>
                                    ))}
                                </Stack>
                            )}
                    </Paper>
                </SimpleGrid>

                {/* Order status breakdown */}
                <Paper withBorder p="lg" radius="md">
                    <ChartHeader icon="solar:chart-2-bold" color="teal" title={`Phân bổ trạng thái đơn hàng (${rangeNum} ngày)`} />
                    {isLoading ? <Stack gap="xs">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={28} />)}</Stack>
                        : statusBreakdown.length === 0 ? <Text c="dimmed" size="sm" ta="center" py="md">Chưa có đơn hàng</Text>
                            : (
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                    {statusBreakdown.map(([s, count]) => (
                                        <Box key={s}>
                                            <Group justify="space-between" mb={4}>
                                                <Badge size="xs" color={STATUS_COLOR_MANTINE[s] ?? 'gray'} variant="light">{s}</Badge>
                                                <Text size="xs" fw={600}>{count} ({Math.round(count / totalInRange * 100)}%)</Text>
                                            </Group>
                                            <Progress value={count / totalInRange * 100}
                                                color={STATUS_COLOR_MANTINE[s] ?? 'gray'} size="sm" radius="xl" />
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            )}
                </Paper>

                {/* Quick links */}
                <Paper withBorder p="lg" radius="md">
                    <Text fw={700} mb="md">Truy cập nhanh</Text>
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                        {[
                            { href: '/seller/products', icon: 'solar:box-bold', label: 'Sản phẩm', color: 'blue' },
                            { href: '/seller/orders', icon: 'solar:clipboard-list-bold', label: 'Đơn hàng', color: 'green' },
                            { href: '/seller/vouchers', icon: 'solar:ticket-sale-bold', label: 'Voucher', color: 'violet' },
                            { href: '/seller/campaigns', icon: 'solar:megaphone-bold', label: 'Chiến dịch', color: 'orange' },
                        ].map(item => (
                            <Paper key={item.href} component={Link} href={item.href} withBorder p="md" radius="md"
                                style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                <Group gap="sm">
                                    <ThemeIcon size={36} radius="md" variant="light" color={item.color}>
                                        <Iconify icon={item.icon} width={20} />
                                    </ThemeIcon>
                                    <Text fw={600} size="sm">{item.label}</Text>
                                </Group>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Paper>
            </Stack>
        </Container>
    );
}
