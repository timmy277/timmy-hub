'use client';

import { Group, Box, Avatar, Text, Menu, UnstyledButton, ActionIcon, Divider, Breadcrumbs, Anchor, Button } from '@mantine/core';
import { LanguageSwitcher, ThemeSwitcher } from '../shared';
import { Logo } from '../common';
import { CartBadge } from '../cart/CartBadge';
import { NotificationBell } from './NotificationBell';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/types/auth';

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
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // ===== Component Logic =====
    const isAdminPage = pathname.startsWith('/admin');
    const isSellerPage = pathname.startsWith('/seller');
    const showSidebarToggle = isAdminPage || isSellerPage;
    const segments = pathname.split('/').filter(p => p);

    const breadcrumbItems = [
        <Anchor component={Link} href="/" key="home" size="sm" c="dimmed">
            <Group gap={4} wrap="nowrap">
                <Iconify icon="mage:dashboard-bar-notification" width={14} />
                <span>{t('sidebar.dashboard')}</span>
            </Group>
        </Anchor>,
        ...segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            const label = t(`sidebar.${segment}`, {
                defaultValue: segment.charAt(0).toUpperCase() + segment.slice(1),
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
                {withSidebarToggle && showSidebarToggle && (
                    <ActionIcon
                        onClick={toggleSidebar}
                        variant="subtle"
                        color="gray"
                        size="lg"
                        radius="md"
                    >
                        {collapsed ? (
                            <Iconify icon="majesticons:menu-line" width={22} />
                        ) : (
                            <Iconify icon="majesticons:menu-line" width={22} />
                        )}
                    </ActionIcon>
                )}

                {isAdminPage || isSellerPage ? (
                    <Breadcrumbs separator={<Iconify icon="weui:arrow-filled" width={14} opacity={0.5} />} ml="sm">
                        {breadcrumbItems}
                    </Breadcrumbs>
                ) : (
                    <Logo />
                )}
            </Group>

            <Group gap="md">
                {user && <NotificationBell />}
                {!isAdminPage && <CartBadge />}
                {user && !isAdminPage && (
                    user.roles?.includes(UserRole.SELLER) ? (
                        <Button
                            component={Link}
                            href="/seller"
                            variant="light"
                            size="sm"
                            leftSection={<Iconify icon="solar:shop-bold" width={18} />}
                        >
                            {t('appBar.myStore')}
                        </Button>
                    ) : (
                        (user.roles?.includes(UserRole.CUSTOMER) || user.roles?.includes(UserRole.BRAND) || user.roles?.includes(UserRole.SHIPPER)) && (
                            <Button
                                component={Link}
                                href="/seller"
                                variant="default"
                                size="sm"
                                leftSection={<Iconify icon="solar:shop-bold" width={18} />}
                            >
                                {t('appBar.becomeSeller')}
                            </Button>
                        )
                    )
                )}
                <LanguageSwitcher />
                <ThemeSwitcher />

                <Divider orientation="vertical" h={24} my="auto" />

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
            </Group>
        </Group>
    );
}
