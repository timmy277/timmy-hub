'use client';

import { Menu, Avatar, Text, Box, Group, UnstyledButton } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

function displayName(user: { profile?: { firstName?: string; lastName?: string; displayName?: string }; email?: string }): string {
    const p = user?.profile;
    if (p?.displayName) return p.displayName;
    if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
    return user?.email ?? '';
}

export function UserMenu() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    return (
        <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
                <UnstyledButton className="p-1 px-2 rounded-md transition-colors hover:bg-(--mantine-color-gray-hover) dark:hover:bg-(--mantine-color-dark-6)">
                    <Group gap="sm">
                        <Avatar
                            radius="xl"
                            size="md"
                            src={user?.profile?.avatar}
                            alt={user ? displayName(user) : ''}
                        >
                            {user ? (displayName(user) || '?').slice(0, 2).toUpperCase() : 'G'}
                        </Avatar>
                    </Group>
                </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
                <Box className="px-3 py-2">
                    <Group gap="sm">
                        <Avatar
                            radius="xl"
                            size="lg"
                            src={user?.profile?.avatar}
                            alt={user ? displayName(user) : ''}
                        >
                            {user ? (displayName(user) || '?').slice(0, 2).toUpperCase() : 'G'}
                        </Avatar>
                        <Box>
                            <Text size="sm" fw={600}>
                                {user ? displayName(user) || user.email : t('common.guest')}
                            </Text>
                            {user?.roles && user.roles.length > 0 && !user.roles.includes(UserRole.CUSTOMER) && (
                                <Text size="xs" c="dimmed">
                                    {user.roles.map(r => r.toLowerCase()).join(', ')}
                                </Text>
                            )}
                        </Box>
                    </Group>
                </Box>
                <Menu.Divider />
                <Menu.Label>{t('common.application')}</Menu.Label>
                <Menu.Item
                    component={Link}
                    href="/profile"
                    leftSection={<Iconify icon="solar:user-bold" width={16} />}
                >
                    {t('common.profile')}
                </Menu.Item>
                <Menu.Item leftSection={<Iconify icon="solar:settings-bold" width={16} />}>
                    {t('common.settings')}
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>{t('common.dangerZone')}</Menu.Label>
                <Menu.Item
                    color="red"
                    leftSection={<Iconify icon="solar:logout-bold" width={16} />}
                    onClick={() => logout()}
                >
                    {t('common.logout')}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
