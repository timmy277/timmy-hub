'use client';

import { Group, Box, Avatar, Text, Menu, UnstyledButton, ActionIcon, Divider } from '@mantine/core';
import { LanguageSwitcher, ThemeSwitcher } from '../shared';
import {
    IconSettings,
    IconLogout,
    IconUser,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarRightCollapse
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';

export function AppBar() {
    const { t } = useTranslation();
    const { collapsed, toggleSidebar } = useSidebarStore();

    return (
        <Group justify="space-between" h="100%" px="md">
            <Group>
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

                <Box className="hidden sm:block ml-2">
                    <Text fw={600} size="lg">
                        Dashboard
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
    );
}
