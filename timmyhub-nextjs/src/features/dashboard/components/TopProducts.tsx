'use client';

import { ReactElement } from 'react';
import { Paper, Text, Stack, Group, Image, Badge, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { formatVND, formatCompact } from '@/utils/currency';
import type { TopProduct } from '@/types/dashboard';

interface TopProductsProps {
    data: TopProduct[];
}

export function TopProducts({ data }: TopProductsProps): ReactElement {
    const { t } = useTranslation('common');

    if (!data.length) {
        return (
            <Paper withBorder radius="lg" p="lg">
                <Text fw={600} size="lg" mb="md">
                    {t('dashboard.topProducts')}
                </Text>
                <Text c="dimmed" size="sm" ta="center" py="xl">
                    {t('dashboard.noData')}
                </Text>
            </Paper>
        );
    }

    return (
        <Paper withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
                {t('dashboard.topProducts')}
            </Text>
            <Stack gap={0}>
                {data.slice(0, 8).map((product, idx) => (
                    <Group
                        key={product.id}
                        justify="space-between"
                        py="xs"
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        style={{ borderBottom: idx < data.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    >
                        <Group gap="sm">
                            <Text size="sm" fw={600} c="dimmed" w={20} ta="center">
                                #{idx + 1}
                            </Text>
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    w={36}
                                    h={36}
                                    radius="sm"
                                    className="object-cover"
                                />
                            ) : (
                                <Box w={36} h={36} className="rounded-sm bg-slate-200 dark:bg-slate-700" />
                            )}
                            <Stack gap={2}>
                                <Text size="sm" fw={500} lineClamp={1} maw={180}>
                                    {product.name}
                                </Text>
                                <Badge size="xs" variant="light" color="blue">
                                    {formatCompact(product.soldCount)} {t('dashboard.sold')}
                                </Badge>
                            </Stack>
                        </Group>
                        <Stack gap={2} align="flex-end">
                            <Text size="sm" fw={700} className="text-sky-600 dark:text-sky-400">
                                {formatVND(product.revenue)}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {t('dashboard.revenue')}
                            </Text>
                        </Stack>
                    </Group>
                ))}
            </Stack>
        </Paper>
    );
}
