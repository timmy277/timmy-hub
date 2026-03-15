'use client';

import { Box, Container, Flex, NavLink, Paper, Stack, Title } from '@mantine/core';
import {
    IconTicket,
    IconUser,
    IconPackage,
    IconMapPin,
    IconLock,
    IconBell,
    IconHeart,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SIDEBAR_ITEMS = [
    { label: 'Voucher', href: '/profile/voucher', icon: IconTicket },
    { label: 'Thông tin cá nhân', href: '/profile', icon: IconUser },
    { label: 'Đơn hàng của tôi', href: '/profile/orders', icon: IconPackage },
    { label: 'Sản phẩm yêu thích', href: '/profile/wishlist', icon: IconHeart },
    { label: 'Địa chỉ', href: '/profile/addresses', icon: IconMapPin },
    { label: 'Đổi mật khẩu', href: '/profile/change-password', icon: IconLock },
    { label: 'Cài đặt thông báo', href: '/profile/notifications', icon: IconBell },
] as const;

export function ProfileLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <Container size="xl" py="xl">
            <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="md"
                shadow="sm"
                bg="var(--mantine-color-white)"
                style={{
                    minHeight: 380,
                    border: '1px solid var(--mantine-color-default-border)',
                }}
            >
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    gap="xl"
                    wrap="nowrap"
                >
                    {/* Sidebar bên trái */}
                    <Box
                        component="nav"
                        w={{ base: '100%', md: 260 }}
                        style={{ flexShrink: 0 }}
                        pb={{ base: 'md', md: 0 }}
                        className="md:border-r md:border-solid md:border-(--mantine-color-default-border) md:pr-xl"
                    >
                        <Title order={5} mb="sm" c="dimmed">
                            Tài khoản
                        </Title>
                        <Stack gap={2}>
                            {SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => {
                                const active =
                                    pathname === href ||
                                    (href !== '/profile' && pathname.startsWith(href));
                                return (
                                    <NavLink
                                        key={href}
                                        component={Link}
                                        href={href}
                                        label={label}
                                        leftSection={<Icon size={18} />}
                                        active={active}
                                        variant="light"
                                    />
                                );
                            })}
                        </Stack>
                    </Box>
                    {/* Nội dung trang bên phải */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        {children}
                    </Box>
                </Flex>
            </Paper>
        </Container>
    );
}
