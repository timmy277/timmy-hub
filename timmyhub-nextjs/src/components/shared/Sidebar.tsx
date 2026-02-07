'use client';

import { useState, useEffect } from 'react';
import {
    Stack,
    Tooltip,
    rem,
    NavLink,
    Box,
    ActionIcon,
    Text,
    Group,
    Menu,
} from '@mantine/core';
import {
    IconGauge,
    IconDeviceDesktopAnalytics,
    IconFingerprint,
    IconCalendarStats,
    IconUser,
    IconSettings,
    IconChevronRight,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarRightCollapse,
    IconShoppingCart,
    IconPackage,
    IconUsers,
} from '@tabler/icons-react';

interface SidebarItem {
    icon: any;
    label: string;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string; icon: any }[];
}

const mockData: SidebarItem[] = [
    { label: 'Dashboard', icon: IconGauge },
    {
        label: 'E-commerce',
        icon: IconShoppingCart,
        initiallyOpened: true,
        links: [
            { label: 'Products', link: '/', icon: IconPackage },
            { label: 'Orders', link: '/', icon: IconCalendarStats },
            { label: 'Customers', link: '/', icon: IconUsers },
        ],
    },
    {
        label: 'Analytics',
        icon: IconDeviceDesktopAnalytics,
        links: [
            { label: 'Realtime', link: '/', icon: IconGauge },
            { label: 'Reports', link: '/', icon: IconCalendarStats },
        ],
    },
    { label: 'Security', icon: IconFingerprint },
    { label: 'Settings', icon: IconSettings },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState('Dashboard');

    return (
        <Box
            component="nav"
            className="bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 flex flex-col h-screen sticky top-0 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden"
            style={{
                width: collapsed ? rem(80) : rem(280),
                minWidth: collapsed ? rem(80) : rem(280),
            }}
        >
            {/* Header */}
            <Box p="md" mb="md">
                <Group justify={collapsed ? 'center' : 'space-between'} wrap="nowrap">
                    {!collapsed && (
                        <Text fw={900} size="xl" className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            TIMMYHUB
                        </Text>
                    )}
                    <ActionIcon
                        onClick={() => setCollapsed((c) => !c)}
                        variant="subtle"
                        color="gray"
                        size="lg"
                        radius="md"
                    >
                        {collapsed ? <IconLayoutSidebarRightCollapse size={22} /> : <IconLayoutSidebarLeftCollapse size={22} />}
                    </ActionIcon>
                </Group>
            </Box>

            {/* Main Menu */}
            <Box px="sm" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <Stack gap={4}>
                    {mockData.map((item) => (
                        <SidebarNavLink
                            key={item.label}
                            item={item}
                            collapsed={collapsed}
                            active={active === item.label}
                            onActive={() => setActive(item.label)}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Footer */}
            <Box p="sm" className="border-t border-zinc-100 dark:border-zinc-800">
                <SidebarNavLink
                    item={{ label: 'Profile', icon: IconUser }}
                    collapsed={collapsed}
                    active={active === 'Profile'}
                    onActive={() => setActive('Profile')}
                />
            </Box>
        </Box>
    );
}

function SidebarNavLink({
    item,
    collapsed,
    active,
    onActive,
}: {
    item: SidebarItem;
    collapsed: boolean;
    active: boolean;
    onActive: () => void;
}) {
    const [opened, setOpened] = useState(item.initiallyOpened || false);
    const hasLinks = Array.isArray(item.links);
    const Icon = item.icon;

    // Sync opened state when sidebar expands/collapses
    useEffect(() => {
        if (collapsed) setOpened(false);
        else if (item.initiallyOpened) setOpened(true);
    }, [collapsed, item.initiallyOpened]);

    const navLink = (
        <NavLink
            label={
                <Text
                    size="sm"
                    fw={600}
                    className={`transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                >
                    {item.label}
                </Text>
            }
            leftSection={
                <Box className="flex items-center justify-center w-8">
                    <Icon size={22} stroke={1.5} />
                </Box>
            }
            active={active}
            onClick={() => {
                onActive();
                if (hasLinks && !collapsed) setOpened((o) => !o);
            }}
            opened={opened && !collapsed}
            childrenOffset={collapsed ? 0 : 32}
            className={`rounded-md transition-all duration-200 ${collapsed ? 'px-0 justify-center' : ''}`}
            rightSection={
                hasLinks && !collapsed ? (
                    <IconChevronRight
                        size="0.8rem"
                        stroke={1.5}
                        className={`transition-transform duration-200 ${opened ? 'rotate-90' : ''}`}
                    />
                ) : null
            }
            styles={{
                root: {
                    height: rem(48),
                    paddingLeft: collapsed ? 0 : undefined,
                    paddingRight: collapsed ? 0 : undefined,
                },
                body: {
                    display: collapsed ? 'none' : 'block',
                }
            }}
        >
            {!collapsed &&
                item.links?.map((link) => (
                    <NavLink
                        key={link.label}
                        label={<Text size="xs" fw={500}>{link.label}</Text>}
                        leftSection={<link.icon size={18} stroke={1.5} />}
                        className="rounded-md mb-0.5 h-10"
                    />
                ))}
        </NavLink>
    );

    if (collapsed) {
        if (hasLinks) {
            return (
                <Menu position="right-start" offset={20} withArrow shadow="xl" trigger="hover" openDelay={50}>
                    <Menu.Target>
                        <Box>
                            <Tooltip label={item.label} position="right" withArrow offset={15} disabled={active}>
                                {navLink}
                            </Tooltip>
                        </Box>
                    </Menu.Target>
                    <Menu.Dropdown p="xs" className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ml-1">
                        <Menu.Label className="font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                            {item.label}
                        </Menu.Label>
                        {item.links?.map((link) => (
                            <Menu.Item
                                key={link.label}
                                leftSection={<link.icon size={18} stroke={1.5} />}
                                className="rounded-md font-medium py-2"
                            >
                                {link.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            );
        }

        return (
            <Tooltip label={item.label} position="right" withArrow offset={15}>
                <Box>{navLink}</Box>
            </Tooltip>
        );
    }

    return navLink;
}
