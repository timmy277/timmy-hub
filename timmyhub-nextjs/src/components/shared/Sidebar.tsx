'use client';

import { useState, useEffect } from 'react';
import {
    Stack,
    Tooltip,
    rem,
    NavLink,
    Box,
    Text,
    Group,
    Menu,
    Collapse,
} from '@mantine/core';
import {
    IconGauge,
    IconDeviceDesktopAnalytics,
    IconCalendarStats,
    IconUser,
    IconSettings,
    IconChevronRight,
    IconShoppingCart,
    IconPackage,
    IconUsers,
    IconFingerprint,
    IconProps,
} from '@tabler/icons-react';
import { useSidebarStore } from '@/stores/useSidebarStore';

// Định nghĩa type icon cụ thể thay vì dùng any
type TablerIcon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

interface SidebarItem {
    icon: TablerIcon;
    label: string;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string; icon: TablerIcon }[];
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
    const { collapsed } = useSidebarStore();
    const [active, setActive] = useState('Dashboard');

    // Bỏ logmounted vì đã nạp dynamic ssr:false từ page.tsx
    return (
        <Box
            className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out"
            style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
        >
            {/* Header - Logo Section */}
            <Box
                h={70}
                className="flex items-center shrink-0 transition-all duration-300"
                style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
            >
                <Box className="w-full" px={collapsed ? 0 : 'md'}>
                    <Group
                        gap={collapsed ? 0 : rem(12)}
                        wrap="nowrap"
                        justify={collapsed ? 'center' : 'flex-start'}
                        className="transition-all duration-300"
                    >
                        <Box className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <Text fw={900} c="white" size="lg" className="tracking-tighter pl-[1px]">T</Text>
                        </Box>

                        <Box
                            className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                            style={{
                                maxWidth: collapsed ? 0 : "200px",
                                opacity: collapsed ? 0 : 1,
                                transform: `translateX(${collapsed ? '-10px' : '0'})`,
                            }}
                        >
                            <Text fw={800} size="lg" className="tracking-tight ml-1">
                                TIMMY<span className="text-blue-600">HUB</span>
                            </Text>
                        </Box>
                    </Group>
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                px={collapsed ? 0 : rem(12)}
                py="md"
                className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-150"
            >
                <Stack gap={4} align={collapsed ? 'center' : 'stretch'} className="w-full">
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
            <Box
                p={collapsed ? 0 : rem(12)}
                py="md"
                className="shrink-0 transition-all duration-150"
            >
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

    useEffect(() => {
        if (collapsed) setOpened(false);
        else if (item.initiallyOpened) setOpened(true);
    }, [collapsed, item.initiallyOpened]);

    const navLink = (
        <NavLink
            label={
                <Box
                    className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                    style={{
                        maxWidth: collapsed ? 0 : "200px",
                        opacity: collapsed ? 0 : 1,
                    }}
                >
                    <Text size="sm" fw={600} className="pl-1.5">{item.label}</Text>
                </Box>
            }
            leftSection={
                <Box className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-full' : 'w-6'}`}>
                    <Icon size={22} stroke={1.5} />
                </Box>
            }
            active={active}
            variant="filled"
            onClick={() => {
                onActive();
                if (hasLinks && !collapsed) setOpened((o) => !o);
            }}
            opened={opened && !collapsed}
            className="rounded-lg transition-all duration-200"
            rightSection={
                <Box
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        maxWidth: (hasLinks && !collapsed) ? "30px" : 0,
                        opacity: (hasLinks && !collapsed) ? 1 : 0
                    }}
                >
                    <IconChevronRight
                        size="0.9rem"
                        stroke={2}
                        className={`transition-transform duration-300 ${opened ? 'rotate-90' : ''}`}
                    />
                </Box>
            }
            styles={{
                root: {
                    height: rem(48),
                    width: collapsed ? rem(48) : '100%',
                    padding: collapsed ? 0 : rem(12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                },
                section: {
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    flex: 'none',
                },
                body: {
                    overflow: 'hidden',
                    flex: collapsed ? 0 : 1,
                    transition: 'all 0.3s ease-in-out',
                },
            }}
        />
    );

    if (collapsed) {
        if (hasLinks) {
            return (
                <Menu position="right-start" offset={20} withArrow shadow="xl" trigger="hover" openDelay={50} transitionProps={{ transition: 'pop-top-right', duration: 200 }}>
                    <Menu.Target>
                        <Box>
                            {navLink}
                        </Box>
                    </Menu.Target>
                    <Menu.Dropdown p="xs" className="ml-1 rounded-xl shadow-2xl">
                        <Menu.Label className="font-bold pb-2 border-b mb-1">
                            {item.label}
                        </Menu.Label>
                        {item.links?.map((link) => (
                            <Menu.Item
                                key={link.label}
                                leftSection={<link.icon size={18} stroke={1.5} />}
                                className="rounded-lg font-medium py-2 transition-colors"
                            >
                                {link.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            );
        }

        return (
            <Tooltip label={item.label} position="right" withArrow offset={15} transitionProps={{ transition: 'fade', duration: 200 }}>
                <Box>{navLink}</Box>
            </Tooltip>
        );
    }

    return (
        <>
            {navLink}
            <Collapse in={opened && !collapsed}>
                <Stack gap={2} mt={2} className="ml-5 pl-2">
                    {item.links?.map((link) => (
                        <NavLink
                            key={link.label}
                            label={<Text size="sm" fw={500}>{link.label}</Text>}
                            leftSection={<link.icon size={18} stroke={1.5} />}
                            className="rounded-lg h-10 transition-all"
                            styles={{
                                root: { paddingLeft: rem(12) }
                            }}
                        />
                    ))}
                </Stack>
            </Collapse>
        </>
    );
}
