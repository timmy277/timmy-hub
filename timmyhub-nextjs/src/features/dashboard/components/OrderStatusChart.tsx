'use client';

import { ReactElement, useMemo } from 'react';
import { Paper, Text } from '@mantine/core';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { OrderStatusItem } from '@/types/dashboard';

interface OrderStatusChartProps {
    data: OrderStatusItem[];
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    PROCESSING: '#8b5cf6',
    PACKED: '#a855f7',
    SHIPPING: '#06b6d4',
    DELIVERED: '#10b981',
    COMPLETED: '#22c55e',
    CANCELLED: '#ef4444',
    RETURN_REQUESTED: '#f97316',
    RETURNED: '#f97316',
    REFUNDED: '#64748b',
};

const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
}) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-xs text-slate-500">{item.value} đơn ({(item.payload.percent * 100).toFixed(0)}%)</p>
        </div>
    );
};

export function OrderStatusChart({ data }: OrderStatusChartProps): ReactElement {
    const { t } = useTranslation('common');
    const total = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

    const chartData = useMemo(
        () => data.map((d) => ({ name: d.label, value: d.count, color: STATUS_COLORS[d.status] ?? '#94a3b8' })),
        [data],
    );

    return (
        <Paper withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
                {t('dashboard.orderStatus')}
            </Text>
            {chartData.length === 0 ? (
                <Text c="dimmed" size="sm" ta="center" py="xl">
                    {t('dashboard.noData')}
                </Text>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
            <div className="mt-2 border-t border-slate-100 pt-2 text-center dark:border-slate-800">
                <Text size="xs" c="dimmed">
                    {t('dashboard.totalOrdersCount')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span>
                </Text>
            </div>
        </Paper>
    );
}
