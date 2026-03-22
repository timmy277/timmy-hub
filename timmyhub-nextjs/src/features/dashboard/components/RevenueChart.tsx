'use client';

import { ReactElement, useMemo } from 'react';
import { Paper, Text, Group, SegmentedControl, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import dayjs from 'dayjs';
import type { RevenueByDay } from '@/types/dashboard';
import { formatCompact } from '@/utils/currency';

interface RevenueChartProps {
    data: RevenueByDay[];
    period: '7d' | '30d';
    onPeriodChange: (p: '7d' | '30d') => void;
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;
    const d = dayjs(label as string).format('DD/MM/YYYY');
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-1 text-xs font-medium text-slate-500">{d}</p>
            {payload.map((p) => (
                <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
                    {p.name === 'revenue' ? `${formatCompact(p.value)}đ` : `${p.value} đơn`}
                </p>
            ))}
        </div>
    );
};

export function RevenueChart({ data, period, onPeriodChange }: RevenueChartProps): ReactElement {
    const { t } = useTranslation('common');

    const chartData = useMemo(() => {
        const sliced = period === '7d' ? data.slice(-7) : data;
        return sliced.map((d) => ({
            ...d,
            date: dayjs(d.date).format('DD/MM'),
        }));
    }, [data, period]);

    return (
        <Paper withBorder radius="lg" p="lg">
            <Group justify="space-between" align="center" mb="lg">
                <Text fw={600} size="lg">
                    {t('dashboard.revenueChart')}
                </Text>
                <SegmentedControl
                    size="xs"
                    value={period}
                    onChange={(v) => onPeriodChange(v as '7d' | '30d')}
                    data={[
                        { label: '7 ' + t('dashboard.days'), value: '7d' },
                        { label: '30 ' + t('dashboard.days'), value: '30d' },
                    ]}
                />
            </Group>
            <Stack gap="md">
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => formatCompact(v)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: '#6366f1' }}
                            name="revenue"
                        />
                    </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="orders"
                            fill="#0ea5e9"
                            radius={[4, 4, 0, 0]}
                            name="orders"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Stack>
        </Paper>
    );
}
