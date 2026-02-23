'use client';

import { Group, Box, Avatar, Text, Menu, UnstyledButton, ActionIcon, Divider, Breadcrumbs, Anchor } from '@mantine/core';
import { LanguageSwitcher, ThemeSwitcher } from '../shared';
import { Logo } from '../common';
import { CartBadge } from '../cart/CartBadge';
import {
    IconSettings,
    IconLogout,
    IconUser,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarRightCollapse,
    IconChevronRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AppBarProps {
    withSidebarToggle?: boolean;
}

function displayName(user: { profile?: { firstName?: string; lastName?: string; displayName?: string }; email?: string }): string {
    const p = user?.profile;
    if (p?.displayName) return p.displayName;
    if (p?.firstName || p?.lastName) return [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
    return user?.email ?? '';
}

export function AppBar({ withSidebarToggle = true }: AppBarProps) {
    const { t } = useTranslation();
    const { collapsed, toggleSidebar } = useSidebarStore();
    const { user, logout, isProfileLoading } = useAuth();
    const pathname = usePathname();

    // ===== Component Logic =====
    const isAdminPage = pathname.startsWith('/admin');
    const segments = pathname.split('/').filter(p => p);

    const breadcrumbItems = [
        <Anchor component={Link} href="/" key="home" size="sm" c="dimmed">
            {t('sidebar.dashboard')}
        </Anchor>,
        ...segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            // Try to get translation from sidebar or common, fallback to capitalized segment
            const label = t(`sidebar.${segment}`, {
                defaultValue: segment.charAt(0).toUpperCase() + segment.slice(1)
            });
            const isLast = index === segments.length - 1;

            return isLast ? (
                <Text key={path} size="sm" fw={600} c="blue">
                    {label}
                </Text>
            ) : (
                <Anchor component={Link} href={path} key={path} size="sm" c="dimmed">
                    {label}
                </Anchor>
            );
        }),
    ];

    return (
        <Group justify="space-between" h="100%" px="2rem">
            <Group>
                {withSidebarToggle && isAdminPage && (
                    <ActionIcon
                        onClick={toggleSidebar}
                        variant="subtle"
                        color="gray"
                        size="lg"
                        radius="md"
                    >
                        {collapsed ? (
                            <IconLayoutSidebarRightCollapse size={22} stroke={1.5} />
                        ) : (
                            <IconLayoutSidebarLeftCollapse size={22} stroke={1.5} />
                        )}
                    </ActionIcon>
                )}

                {isAdminPage ? (
                    <Breadcrumbs separator={<IconChevronRight size={14} opacity={0.5} />} ml="sm">
                        {breadcrumbItems}
                    </Breadcrumbs>
                ) : (
                    <Logo />
                )}
            </Group>

            <Group gap="md">
                {!isAdminPage && <CartBadge />}
                <LanguageSwitcher />
                <ThemeSwitcher />

                <Divider orientation="vertical" h={24} my="auto" />

                <Menu shadow="md" width={200} position="bottom-end">
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
                                <Box className="hidden lg:block text-left">
                                    <Text size="sm" fw={600} className="leading-tight">
                                        {user ? displayName(user) || user.email : t('common.guest')}
                                    </Text>
                                    <Text size="xs" c="dimmed" className="leading-tight">
                                        {user?.role ?? (isProfileLoading ? '...' : '')}
                                    </Text>
                                </Box>
                            </Group>
                        </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>{t('common.application')}</Menu.Label>
                        <Menu.Item
                            component={Link}
                            href="/profile"
                            leftSection={<IconUser size={16} stroke={1.5} />}
                        >
                            {t('common.profile')}
                        </Menu.Item>
                        <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                            {t('common.settings')}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Label>{t('common.dangerZone')}</Menu.Label>
                        <Menu.Item
                            color="red"
                            leftSection={<IconLogout size={16} stroke={1.5} />}
                            onClick={() => logout()}
                        >
                            {t('auth.logout')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Group>
    );
}
