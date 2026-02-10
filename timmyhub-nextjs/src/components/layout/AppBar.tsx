'use client';

import { Group, Box, Avatar, Text, Menu, UnstyledButton, ActionIcon, Divider } from '@mantine/core';
import { LanguageSwitcher, ThemeSwitcher } from '../shared';
import {
    IconSettings,
    IconLogout,
    IconUser,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarRightCollapse,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useAuth } from '@/hooks/useAuth';

interface AppBarProps {
    withSidebarToggle?: boolean;
    title?: string;
}

export function AppBar({ withSidebarToggle = true, title = 'Dashboard' }: AppBarProps) {
    // ===== Hooks & Context =====
    const { t } = useTranslation();
    const { collapsed, toggleSidebar } = useSidebarStore();
    const { logout } = useAuth();

    return (
        <Group justify="space-between" h="100%" px="md">
            <Group>
                {withSidebarToggle && (
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

                <Box className={`${withSidebarToggle ? 'hidden sm:block ml-2' : 'ml-1'}`}>
                    <Text fw={800} size="xl" className="tracking-tight">
                        TIMMY<span className="text-blue-600">HUB</span>
                    </Text>
                </Box>
            </Group>

            <Group gap="md">
                <LanguageSwitcher />
                <ThemeSwitcher />

                <Divider orientation="vertical" h={24} my="auto" />

                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <UnstyledButton className="p-1 px-2 rounded-md transition-colors hover:bg-[var(--mantine-color-gray-hover)] dark:hover:bg-[var(--mantine-color-dark-6)]">
                            <Group gap="sm">
                                <Avatar
                                    radius="xl"
                                    size="md"
                                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                                />
                                <Box className="hidden lg:block text-left">
                                    <Text size="sm" fw={600} className="leading-tight">
                                        Timmy Hub
                                    </Text>
                                    <Text size="xs" c="dimmed" className="leading-tight">
                                        Admin
                                    </Text>
                                </Box>
                            </Group>
                        </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>{t('common.application')}</Menu.Label>
                        <Menu.Item leftSection={<IconUser size={16} stroke={1.5} />}>
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
