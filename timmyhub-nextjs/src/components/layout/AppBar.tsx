'use client';

import { Group, Text, Divider, ActionIcon, Breadcrumbs, Anchor } from '@mantine/core';
import { LanguageSwitcher, ThemeSwitcher } from '../shared';
import { Logo } from '../common';
import { CartBadge } from '../cart/CartBadge';
import { NotificationBell } from './NotificationBell';
import { MessageIcon } from './MessageIcon';
import { SellerButton } from './SellerButton';
import { UserMenu } from './UserMenu';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useChatUnread } from '@/hooks/useChatUnread';
import { SearchBar } from '@/components/common/SearchBar';

interface AppBarProps {
    withSidebarToggle?: boolean;
}

export function AppBar({ withSidebarToggle = true }: AppBarProps) {
    const { t } = useTranslation();
    const { collapsed, toggleSidebar } = useSidebarStore();
    const { user } = useAuth();
    const pathname = usePathname();

    // Sync unread counts từ BE vào store
    useChatUnread();

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
            const translated = t(`sidebar.${segment}`, { defaultValue: '' });
            const label = typeof translated === 'string' && translated
                ? translated
                : segment.charAt(0).toUpperCase() + segment.slice(1);
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

            {/* Search bar - chỉ hiện ở main layout */}
            {!isAdminPage && !isSellerPage && (
                <SearchBar />
            )}

            <Group gap="md">
                {user && !isAdminPage && <SellerButton user={user} />}
                {user && <NotificationBell />}
                {user && <MessageIcon />}
                {!isAdminPage && <CartBadge />}
                <LanguageSwitcher />
                <ThemeSwitcher />

                <Divider orientation="vertical" h={24} my="auto" />

                <UserMenu />
            </Group>
        </Group>
    );
}
