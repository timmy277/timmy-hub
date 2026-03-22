'use client';

import { ReactElement } from 'react';
import { Paper, Text, Stack, Group, ThemeIcon, Box, Tooltip } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import type { ActivityItem } from '@/types/dashboard';

dayjs.extend(relativeTime);

interface ActivityFeedProps {
    data: ActivityItem[];
}

const ACTION_ICONS: Record<string, { icon: string; color: string }> = {
    CREATE_USER: { icon: 'tabler:user-plus', color: 'green' },
    UPDATE_USER: { icon: 'tabler:user-check', color: 'blue' },
    DELETE_USER: { icon: 'tabler:user-x', color: 'red' },
    USER_LOGIN: { icon: 'tabler:shield', color: 'violet' },
    CREATE_ORDER: { icon: 'tabler:shopping-cart', color: 'teal' },
    UPDATE_ORDER_STATUS: { icon: 'tabler:shopping-cart-check', color: 'cyan' },
    CANCEL_ORDER: { icon: 'tabler:shopping-cart-x', color: 'orange' },
    APPROVE_PRODUCT: { icon: 'tabler:package', color: 'green' },
    REJECT_PRODUCT: { icon: 'tabler:package-off', color: 'red' },
    UPDATE_PRODUCT: { icon: 'tabler:package', color: 'blue' },
    DELETE_PRODUCT: { icon: 'tabler:package-off', color: 'red' },
    UPDATE_ROLE: { icon: 'tabler:lock', color: 'violet' },
    CREATE_ROLE: { icon: 'tabler:settings', color: 'green' },
    DELETE_ROLE: { icon: 'tabler:settings', color: 'red' },
    UPDATE_PERMISSION: { icon: 'tabler:shield', color: 'blue' },
    CREATE_PERMISSION: { icon: 'tabler:shield', color: 'green' },
    DELETE_PERMISSION: { icon: 'tabler:shield', color: 'red' },
    APPROVE_SELLER: { icon: 'tabler:user-check', color: 'teal' },
    REJECT_SELLER: { icon: 'tabler:user-x', color: 'orange' },
    CREATE_VOUCHER: { icon: 'tabler:ticket', color: 'green' },
    DELETE_VOUCHER: { icon: 'tabler:ticket', color: 'red' },
    UPDATE_SETTINGS: { icon: 'tabler:settings', color: 'blue' },
};

const DEFAULT_ACTION = { icon: 'tabler:edit', color: 'gray' };

function getActionMeta(action: string): { icon: string; color: string; label: string } {
    const upper = action.toUpperCase();
    let found = DEFAULT_ACTION;
    for (const [key, val] of Object.entries(ACTION_ICONS)) {
        if (upper.includes(key)) {
            found = val;
            break;
        }
    }
    return { ...found, label: upper.replace(/_/g, ' ') };
}

export function ActivityFeed({ data }: ActivityFeedProps): ReactElement {
    const { i18n } = useTranslation();
    const isVi = i18n.language === 'vi';

    if (!data.length) {
        return (
            <Paper withBorder radius="lg" p="lg">
                <Text fw={600} size="lg" mb="md">
                    Hoạt động gần đây
                </Text>
                <Text c="dimmed" size="sm" ta="center" py="xl">
                    Chưa có dữ liệu
                </Text>
            </Paper>
        );
    }

    return (
        <Paper withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
                Hoạt động gần đây
            </Text>
            <Stack gap={0}>
                {data.map((item, idx) => {
                    const { icon, color, label } = getActionMeta(item.action);
                    const isSuccess = item.status === 'SUCCESS';
                    return (
                        <Group
                            key={item.id}
                            gap="sm"
                            py="xs"
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            style={{ borderBottom: idx < data.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                        >
                            <Tooltip label={label} position="left">
                                <ThemeIcon size={28} radius="xl" variant="light" color={color}>
                                    <Iconify icon={icon} width={14} height={14} />
                                </ThemeIcon>
                            </Tooltip>
                            <Box flex={1}>
                                <Group gap="xs" wrap="nowrap">
                                    <Text size="sm" fw={500} lineClamp={1}>
                                        {label}
                                    </Text>
                                    {!isSuccess && (
                                        <Tooltip label="Thất bại">
                                            <Box className="text-red-500">
                                                <Iconify icon="tabler:alert-circle" width={12} height={12} />
                                            </Box>
                                        </Tooltip>
                                    )}
                                </Group>
                                <Text size="xs" c="dimmed">
                                    {item.userName}
                                    {item.entityType && ` · ${item.entityType}`}
                                </Text>
                            </Box>
                            <Text size="xs" c="dimmed" className="whitespace-nowrap">
                                {dayjs(item.createdAt).locale(isVi ? 'vi' : 'en').fromNow()}
                            </Text>
                        </Group>
                    );
                })}
            </Stack>
        </Paper>
    );
}
