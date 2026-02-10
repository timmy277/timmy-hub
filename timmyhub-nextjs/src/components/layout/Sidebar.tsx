'use client';

import { useState } from 'react';
import { Stack, Tooltip, rem, NavLink, Box, Text, Group, Menu, Collapse } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    IconGauge,
    IconCalendarStats,
    IconUser,
    IconSettings,
    IconChevronRight,
    IconShoppingCart,
    IconPackage,
    IconUsers,
    IconFingerprint,
    IconProps,
    IconTags,
    IconShieldLock,
    IconKey,
} from '@tabler/icons-react';
import { useSidebarStore } from '@/stores/useSidebarStore';

type TablerIcon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

interface SidebarItem {
    icon: TablerIcon;
    label: string;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string; icon: TablerIcon }[];
}

const mockData: SidebarItem[] = [
    { label: 'Dashboard', icon: IconGauge, link: '/dashboard' },
    {
        label: 'Quản trị',
        icon: IconFingerprint,
        initiallyOpened: true, // This can be dynamic based on pathname too
        links: [
            { label: 'Phân quyền', link: '/admin/roles', icon: IconShieldLock },
            { label: 'Người dùng', link: '/admin/users', icon: IconUsers },
            { label: 'Quyền hạn', link: '/admin/permissions', icon: IconKey },
            { label: 'Danh mục', link: '/admin/categories', icon: IconTags },
        ],
    },
    {
        label: 'E-commerce',
        icon: IconShoppingCart,
        links: [
            { label: 'Products', link: '/products', icon: IconPackage },
            { label: 'Orders', link: '/orders', icon: IconCalendarStats },
            { label: 'Customers', link: '/customers', icon: IconUsers },
        ],
    },
    { label: 'Cài đặt', icon: IconSettings, link: '/settings' },
];

export function Sidebar() {
    const { collapsed } = useSidebarStore();
    const pathname = usePathname();
    const mounted = useMounted();

    const isCollapsed = mounted ? collapsed : false;

    const isActive = (item: SidebarItem) => {
        if (item.link && pathname === item.link) return true;
        if (item.links) {
            return item.links.some(link => pathname === link.link);
        }
        return false;
    };

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
                            <Text
                                fw={900}
                                c="white"
                                size="lg"
                                className="tracking-tighter pl-[1px]"
                            >
                                T
                            </Text>
                        </Box>

                        <Box
                            className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                            style={{
                                maxWidth: collapsed ? 0 : '200px',
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
                    {mockData.map(item => (
                        <SidebarNavLink
                            key={item.label}
                            item={item}
                            collapsed={isCollapsed}
                            active={isActive(item)}
                            pathname={pathname}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Footer */}
            <Box
                p={isCollapsed ? 0 : rem(12)}
                py="md"
                className="shrink-0 transition-all duration-150"
            >
                <SidebarNavLink
                    item={{ label: 'Profile', icon: IconUser, link: '/profile' }} // Added link
                    collapsed={isCollapsed}
                    active={pathname === '/profile'}
                    pathname={pathname}
                />
            </Box>
        </Box>
    );
}

function SidebarNavLink({
    item,
    collapsed,
    active,
    pathname,
}: {
    item: SidebarItem;
    collapsed: boolean;
    active: boolean;
    pathname: string;
}) {
    const hasLinks = Array.isArray(item.links);
    const [opened, setOpened] = useState(() => {
        return (
            item.initiallyOpened ||
            (hasLinks && item.links?.some(link => pathname === link.link)) ||
            false
        );
    });
    const Icon = item.icon;

    const [prevPathname, setPrevPathname] = useState(pathname);

    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (hasLinks && item.links?.some(link => pathname === link.link)) {
            setOpened(true);
        }
    }

    const isChildActive = hasLinks && item.links?.some(link => pathname === link.link);
    const isParentActive = active || isChildActive;

    const commonProps = {
        label: (
            <Box
                className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                style={{
                    maxWidth: collapsed ? 0 : '200px',
                    opacity: collapsed ? 0 : 1,
                }}
            >
                <Text size="sm" fw={600} className="pl-1.5">
                    {item.label}
                </Text>
            </Box>
        ),
        leftSection: (
            <Box
                className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-full' : 'w-6'}`}
            >
                <Icon
                    size={22}
                    stroke={1.5}
                    color={isParentActive ? 'var(--mantine-primary-color-filled)' : undefined}
                />
            </Box>
        ),
        active: isParentActive,
        variant: isParentActive ? 'light' : 'subtle',
        onClick: () => {
            if (hasLinks && !collapsed) setOpened(o => !o);
        },
        opened: opened && !collapsed,
        className: 'rounded-lg transition-all duration-200',
        rightSection: (
            <Box
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxWidth: hasLinks && !collapsed ? '30px' : 0,
                    opacity: hasLinks && !collapsed ? 1 : 0,
                }}
            >
                <IconChevronRight
                    size="0.9rem"
                    stroke={2}
                    className={`transition-transform duration-300 ${opened ? 'rotate-0' : ''}`}
                />
            </Box>
        ),
        styles: {
            root: {
                height: rem(48),
                width: collapsed ? rem(48) : '100%',
                padding: collapsed ? 0 : rem(12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: isParentActive ? 'var(--mantine-primary-color-light)' : undefined,
                color: isParentActive
                    ? 'var(--mantine-primary-color-filled)'
                    : 'var(--mantine-color-text)',
                '&:hover': {
                    backgroundColor: isParentActive
                        ? 'var(--mantine-primary-color-light-hover)'
                        : 'var(--mantine-color-default-hover)',
                },
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
        },
    };

    const navLink = item.link ? (
        <NavLink component={Link} href={item.link} {...commonProps} />
    ) : (
        <NavLink component="button" type="button" {...commonProps} />
    );

    if (collapsed) {
        if (hasLinks) {
            return (
                <Menu
                    position="right-start"
                    offset={20}
                    withArrow
                    shadow="xl"
                    trigger="hover"
                    openDelay={50}
                    transitionProps={{ transition: 'pop-top-right', duration: 200 }}
                >
                    <Menu.Target>
                        <Box>{navLink}</Box>
                    </Menu.Target>
                    <Menu.Dropdown p="xs" className="ml-1 rounded-xl shadow-2xl">
                        <Menu.Label className="font-bold pb-2 border-b mb-1">
                            {item.label}
                        </Menu.Label>
                        {item.links?.map(link => {
                            const isLinkActive = pathname === link.link;
                            return (
                                <Menu.Item
                                    key={link.label}
                                    component={Link}
                                    href={link.link}
                                    leftSection={<link.icon size={18} stroke={1.5} />}
                                    className="rounded-lg font-medium py-2 transition-colors"
                                    style={{
                                        backgroundColor: isLinkActive
                                            ? 'var(--mantine-primary-color-light)'
                                            : undefined,
                                        color: isLinkActive
                                            ? 'var(--mantine-primary-color-filled)'
                                            : undefined,
                                    }}
                                >
                                    {link.label}
                                </Menu.Item>
                            );
                        })}
                    </Menu.Dropdown>
                </Menu>
            );
        }

        return (
            <Tooltip
                label={item.label}
                position="right"
                withArrow
                offset={15}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Box>{navLink}</Box>
            </Tooltip>
        );
    }

    return (
        <>
            {navLink}
            <Collapse in={opened && !collapsed}>
                <Stack gap={2} mt={2} className="ml-5 pl-2">
                    {item.links?.map(link => (
                        <NavLink
                            key={link.label}
                            component={Link}
                            href={link.link}
                            label={
                                <Text size="sm" fw={500}>
                                    {link.label}
                                </Text>
                            }
                            leftSection={<link.icon size={18} stroke={1.5} />}
                            active={pathname === link.link} // Highlight child
                            className="rounded-lg h-10 transition-all"
                            styles={{
                                root: { paddingLeft: rem(12) },
                            }}
                        />
                    ))}
                </Stack>
            </Collapse>
        </>
    );
}
