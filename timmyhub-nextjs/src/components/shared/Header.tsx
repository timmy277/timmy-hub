'use client';

import { Group, Box, Avatar, rem, Text, Menu, UnstyledButton, ActionIcon } from '@mantine/core';
import { LanguageSwitcher, ThemeSwitcher } from './index';
import {
    IconSettings,
    IconLogout,
    IconUser,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarRightCollapse
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';

export function Header() {
    const { t } = useTranslation();
    const { collapsed, toggleSidebar } = useSidebarStore();

    return (
        <Box
            component="header"
            className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10"
            style={{ height: rem(70) }}
            px="md"
        >
            <Group justify="space-between" h="100%">
                <Group>
                    <ActionIcon
                        onClick={toggleSidebar}
                        variant="subtle"
                        color="gray"
                        size="lg"
                        radius="md"
                        className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        {collapsed ? (
                            <IconLayoutSidebarRightCollapse size={22} stroke={1.5} />
                        ) : (
                            <IconLayoutSidebarLeftCollapse size={22} stroke={1.5} />
                        )}
                    </ActionIcon>

                    <Box className="hidden sm:block ml-2">
                        <Text fw={600} size="lg" className="text-zinc-800 dark:text-zinc-200">
                            Dashboard
                        </Text>
                    </Box>
                </Group>

                <Group gap="md">
                    <LanguageSwitcher />
                    <ThemeSwitcher />

                    <Box className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <UnstyledButton className="hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1 px-2 rounded-md transition-colors">
                                <Group gap="sm">
                                    <Avatar
                                        radius="xl"
                                        size="md"
                                        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                                    />
                                    <Box className="hidden lg:block text-left">
                                        <Text size="sm" fw={600} className="leading-tight">Timmy Hub</Text>
                                        <Text size="xs" c="dimmed" className="leading-tight">Admin</Text>
                                    </Box>
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>Application</Menu.Label>
                            <Menu.Item leftSection={<IconUser size={16} stroke={1.5} />}>
                                Profile
                            </Menu.Item>
                            <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                                Settings
                            </Menu.Item>

                            <Menu.Divider />

                            <Menu.Label>Danger Zone</Menu.Label>
                            <Menu.Item color="red" leftSection={<IconLogout size={16} stroke={1.5} />}>
                                {t('common.logout')}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
        </Box>
    );
}
