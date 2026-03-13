'use client';

import { useState, useMemo } from 'react';
import { Logo } from '../common';
import { Stack, Tooltip, rem, NavLink, Box, Text, Menu, Collapse } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Iconify from '../iconify/Iconify';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useAbility } from '@/contexts/AbilityContext';
import { Action, Subject } from '@/libs/ability';

type IconType = string;

// ===== Types & Constants =====
interface SidebarItem {
    icon: IconType;
    label: string;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string; icon: IconType; permission?: PermissionCheck }[];
    permission?: PermissionCheck;
}

interface PermissionCheck {
    action: Action;
    subject: Subject;
}

/** Sidebar cho khu vực seller (không dùng permission, tránh 403 khi click) */
const getSellerSidebarData = (): SidebarItem[] => [
    { label: 'Tổng quan', icon: 'tabler:gauge', link: '/seller' },
    { label: 'Sản phẩm', icon: 'tabler:package', link: '/seller/products' },
    { label: 'Voucher', icon: 'tabler:ticket', link: '/seller/vouchers' },
    { label: 'Khuyến mãi', icon: 'tabler:discount', link: '/seller/campaigns' },
];

const getMockData = (t: TFunction): SidebarItem[] => [
    {
        label: t('sidebar.dashboard'),
        icon: 'tabler:gauge',
        link: '/admin',
    },
    // ===== QUẢN LÝ HỆ THỐNG =====
    {
        label: 'Quản lý hệ thống',
        icon: 'tabler:fingerprint',
        initiallyOpened: true,
        permission: { action: Action.Read, subject: 'SystemRole' },
        links: [
            {
                label: 'Vai trò & Quyền',
                link: '/admin/roles',
                icon: 'tabler:shield-check',
                permission: { action: Action.Read, subject: 'SystemRole' },
            },
            {
                label: 'Người dùng',
                link: '/admin/users',
                icon: 'tabler:users',
                permission: { action: Action.Read, subject: 'User' },
            },
            {
                label: 'Quyền hệ thống',
                link: '/admin/permissions',
                icon: 'tabler:key',
                permission: { action: Action.Read, subject: 'Permission' },
            },
            {
                label: 'Nhật ký hệ thống',
                link: '/admin/system-logs',
                icon: 'tabler:calendar-stats',
                permission: { action: Action.Read, subject: 'SystemRole' },
            },
        ],
    },
    // ===== BÁN HÀNG =====
    {
        label: 'Bán hàng',
        icon: 'tabler:shopping-cart',
        permission: { action: Action.Read, subject: 'Product' },
        links: [
            {
                label: 'Đơn hàng',
                link: '/admin/orders',
                icon: 'tabler:shopping-cart',
                permission: { action: Action.Read, subject: 'Order' },
            },
            {
                label: 'Khách hàng',
                link: '/admin/customers',
                icon: 'tabler:users',
                permission: { action: Action.Read, subject: 'User' },
            },
            {
                label: 'Trò chuyện',
                link: '/admin/chat',
                icon: 'tabler:messages',
                permission: { action: Action.Read, subject: 'User' },
            },
        ],
    },
    // ===== SẢN PHẨM =====
    {
        label: 'Sản phẩm',
        icon: 'tabler:package',
        permission: { action: Action.Read, subject: 'Product' },
        links: [
            {
                label: 'Danh sách sản phẩm',
                link: '/admin/products',
                icon: 'tabler:package',
                permission: { action: Action.Read, subject: 'Product' },
            },
            {
                label: 'Danh mục',
                link: '/admin/categories',
                icon: 'tabler:tags',
                permission: { action: Action.Read, subject: 'Category' },
            },
            {
                label: 'Quản lý Seller',
                link: '/admin/seller-applications',
                icon: 'tabler:building-store',
                permission: { action: Action.Read, subject: 'User' },
            },
        ],
    },
    // ===== KHUYẾN MÃI =====
    {
        label: 'Khuyến mãi',
        icon: 'tabler:discount',
        permission: { action: Action.Read, subject: 'Product' },
        links: [
            {
                label: 'Chương trình KM',
                link: '/admin/campaigns',
                icon: 'tabler:discount',
                permission: { action: Action.Read, subject: 'Product' },
            },
            {
                label: 'Voucher',
                link: '/admin/vouchers',
                icon: 'tabler:ticket',
                permission: { action: Action.Read, subject: 'Product' },
            },
        ],
    },
    // ===== CÀI ĐẶT =====
    {
        label: t('sidebar.settings'),
        icon: 'tabler:settings',
        link: '/admin/settings',
    },
];

export function Sidebar() {
    // ===== Hooks & Context =====
    const { t } = useTranslation();
    const { collapsed } = useSidebarStore();
    const pathname = usePathname();
    const mounted = useMounted();
    const ability = useAbility();

    // ===== Component Logic =====
    const isSellerArea = pathname.startsWith('/seller');
    const mockData = isSellerArea ? getSellerSidebarData() : getMockData(t);
    const isCollapsed = mounted ? collapsed : false;

    // Seller area: show all items. Admin area: filter by permissions
    const filteredData = useMemo(() => {
        if (isSellerArea) return mockData;

        const hasPermission = (permission?: PermissionCheck) => {
            if (!permission) return true;
            return ability.can(permission.action, permission.subject);
        };

        return mockData
            .filter(item => hasPermission(item.permission))
            .map(item => {
                if (item.links) {
                    const filteredLinks = item.links.filter(link => hasPermission(link.permission));
                    if (filteredLinks.length === 0) return null;
                    return { ...item, links: filteredLinks };
                }
                return item;
            })
            .filter((item): item is SidebarItem => item !== null);
    }, [mockData, ability, isSellerArea]);

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
                    <Logo collapsed={collapsed} />
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                px={collapsed ? 0 : rem(12)}
                py="md"
                className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-150"
            >
                <Stack gap={4} align={collapsed ? 'center' : 'stretch'} className="w-full">
                    {filteredData.map(item => (
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
                    item={{
                        label: t('common.profile'),
                        icon: 'tabler:user',
                        link: isSellerArea ? '/profile' : '/admin/profile',
                    }}
                    collapsed={isCollapsed}
                    active={pathname === (isSellerArea ? '/profile' : '/admin/profile')}
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
    const [manuallyOpened, setManuallyOpened] = useState(item.initiallyOpened ?? false);

    const isChildActive = hasLinks && item.links?.some(link => pathname === link.link) === true;
    const opened = manuallyOpened || isChildActive;
    const isParentActive = active || isChildActive;

    const commonProps = {
        label: (
            <Box
                className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap ml-1"
                style={{
                    maxWidth: collapsed ? 0 : '200px',
                    opacity: collapsed ? 0 : 1,
                }}
            >
                <Text size="sm" fw={600} className="pl-1">
                    {item.label}
                </Text>
            </Box>
        ),
        leftSection: (
            <Box
                className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-full' : 'w-6'}`}
            >
                <Iconify
                    icon={item.icon}
                    size={22}
                    color={isParentActive ? 'var(--mantine-primary-color-filled)' : undefined}
                />
            </Box>
        ),
        active: isParentActive,
        variant: isParentActive ? 'light' : 'subtle',
        onClick: () => {
            if (hasLinks && !collapsed) setManuallyOpened(o => !o);
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
                <Iconify
                    icon="tabler:chevron-right"
                    size="0.9rem"
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
                                    leftSection={<Iconify icon={link.icon} size={18} />}
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
                            leftSection={<Iconify icon={link.icon} size={18} />}
                            active={pathname === link.link}
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
