'use client';

import { Paper, Group, Stack, Divider, Button, Rating, Text } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import type { ReviewBreakdown } from '@/types/review';
import { useTranslation } from 'react-i18next';

interface RatingBreakdownProps {
    breakdown: ReviewBreakdown;
    total: number;
    ratingAvg: number;
    onFilter: (star: number | undefined) => void;
    activeFilter: number | undefined;
}

function StarFilterButton({
    star,
    count,
    active,
    onClick,
}: {
    star: number;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    const { t } = useTranslation('common');
    return (
        <Button
            variant={active ? 'filled' : 'default'}
            size="xs"
            radius="xl"
            onClick={onClick}
            leftSection={<Iconify icon="tabler:star" width={12} />}
        >
            {t('reviews.filterStar', { count: star })} {count > 0 && `(${count})`}
        </Button>
    );
}

export function RatingBreakdown({
    breakdown,
    total,
    ratingAvg,
    onFilter,
    activeFilter,
}: RatingBreakdownProps) {
    const { t } = useTranslation('common');
    return (
        <Paper withBorder radius="md" p="md">
            <Group gap="xl" wrap="nowrap" align="flex-start">
                {/* Avg score */}
                <Stack align="center" gap={4} className="min-w-[80px]">
                    <Text
                        component="span"
                        className="text-5xl leading-none text-orange-600"
                        style={{ fontSize: 48, lineHeight: 1, color: 'var(--mantine-color-orange-6)' }}
                    >
                        {ratingAvg.toFixed(1)}
                    </Text>
                    <Rating value={ratingAvg} readOnly fractions={2} size="sm" />
                    <Text size="xs" c="dimmed">{t('reviews.reviewCount', { count: total })}</Text>
                </Stack>

                <Divider orientation="vertical" />

                {/* Breakdown bars */}
                <Stack gap={6} className="flex-1">
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                        const count = breakdown[star] ?? 0;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                            <Group key={star} gap="xs" wrap="nowrap">
                                <Group gap={4} className="w-[50px] justify-end">
                                    <Text size="xs" c="dimmed">{star}</Text>
                                    <Iconify icon="tabler:star" width={12} color="var(--mantine-color-orange-5)" className="fill-orange-500" />
                                </Group>
                                <div className="flex-1">
                                    <div
                                        className="h-3 rounded-full bg-orange-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <Text size="xs" c="dimmed" className="w-8 text-right">{count}</Text>
                            </Group>
                        );
                    })}
                </Stack>
            </Group>

            <Divider my="sm" />
            <Group gap="xs" wrap="wrap">
                <Button
                    variant={activeFilter === undefined ? 'filled' : 'default'}
                    size="xs"
                    radius="xl"
                    onClick={() => onFilter(undefined)}
                >
                    {t('reviews.filterAll')}
                </Button>
                {([5, 4, 3, 2, 1] as const).map((star) => (
                    <StarFilterButton
                        key={star}
                        star={star}
                        count={breakdown[star] ?? 0}
                        active={activeFilter === star}
                        onClick={() => onFilter(star)}
                    />
                ))}
            </Group>
        </Paper>
    );
}
