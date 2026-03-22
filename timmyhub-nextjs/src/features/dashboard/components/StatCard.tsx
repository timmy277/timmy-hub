'use client';

import { ReactElement } from 'react';
import { Paper, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    icon: string;
    color: string;
}

export function StatCard({ title, value, change, icon, color }: StatCardProps): ReactElement {
    const isPositive = (change ?? 0) >= 0;

    return (
        <Paper
            withBorder
            radius="lg"
            p="lg"
            className="hover:shadow-md transition-shadow duration-200"
        >
            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Text size="sm" c="dimmed" fw={500}>
                        {title}
                    </Text>
                    <Text size="xl" fw={700} className="text-2xl font-bold">
                        {value}
                    </Text>
                    {change !== undefined && (
                        <Group gap={4} align="center">
                            <Iconify
                                icon={isPositive ? 'tabler:trending-up' : 'tabler:trending-down'}
                                width={16}
                                className={isPositive ? 'text-green-500' : 'text-red-500'}
                            />
                            <Text size="xs" c={isPositive ? 'teal' : 'red'}>
                                {Math.abs(change)}%
                            </Text>
                            <Text size="xs" c="dimmed">
                                so với kỳ trước
                            </Text>
                        </Group>
                    )}
                </Stack>
                <ThemeIcon
                    size={48}
                    radius="md"
                    variant="light"
                    color={color}
                    className="opacity-80"
                >
                    <Iconify icon={icon} width={24} height={24} />
                </ThemeIcon>
            </Group>
        </Paper>
    );
}
