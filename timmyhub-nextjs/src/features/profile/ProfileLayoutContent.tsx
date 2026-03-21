'use client';

import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Loader,
    NavLink,
    Paper,
    Stack,
    Text,
    Title,
    Avatar,
} from '@mantine/core';
import {
    IconBell,
    IconHeart,
    IconLock,
    IconLogout,
    IconMapPin,
    IconPackage,
    IconPencil,
    IconTicket,
    IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/hooks/useAuth';

function displayUserName(profile: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
} | null): string {
    if (!profile) return '';
    if (profile.displayName) return profile.displayName;
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
}

const SIDEBAR_LINKS = [
    { href: '/profile', labelKey: 'profile.personalInfo', icon: IconUser },
    { href: '/profile/wishlist', labelKey: 'profile.myWishlist', icon: IconHeart },
    { href: '/profile/voucher', labelKey: 'profile.myVouchers', icon: IconTicket },
    { href: '/profile/orders', labelKey: 'profile.myOrders', icon: IconPackage },
    { href: '/profile/addresses', labelKey: 'profile.addresses', icon: IconMapPin },
    { href: '/profile/change-password', labelKey: 'profile.changePassword', icon: IconLock },
    { href: '/profile/notifications', labelKey: 'profile.notificationSettings', icon: IconBell },
] as const;

export function ProfileLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const { user, logout, isLoggingOut } = useAuth();

    const handleChangePhotoClick = (): void => {
        notifications.show({
            title: t('profile.changePhoto'),
            message: t('profile.changePhotoSoon'),
            color: 'blue',
        });
    };

    if (!user) {
        return (
            <Container size="xl" py="xl">
                <Flex justify="center" align="center" direction="column" gap="sm" py={80}>
                    <Loader size="md" color="orange" />
                    <Text c="dimmed" size="sm">
                        {t('common.loading', 'Đang tải...')}
                    </Text>
                </Flex>
            </Container>
        );
    }

    const name = displayUserName(user?.profile || null) || user.email || '';
    const initial = (
        user.profile?.firstName?.charAt(0) ||
        user.email?.charAt(0) ||
        '?'
    ).toUpperCase();

    return (
        <Container size="xl" py={{ base: 'md', md: 'xl' }}>
            <Paper
                p={{ base: 'md', sm: 'xl' }}
                radius="xl"
                shadow="sm"
                className="border border-zinc-200/80 bg-white"
            >
                <Flex
                    direction={{ base: 'column', lg: 'row' }}
                    gap={{ base: 'lg', lg: 'xl' }}
                    align={{ lg: 'flex-start' }}
                >
                    {/* Sidebar */}
                    <Box
                        component="nav"
                        w={{ base: '100%', lg: 300 }}
                        className="shrink-0"
                        aria-label={t('profile.accountMenu')}
                    >
                        <Paper
                            p="lg"
                            radius="lg"
                            className="border border-zinc-100 bg-zinc-50/80"
                        >
                            <Stack gap="md" align="center">
                                <Avatar
                                    src={user.profile?.avatar}
                                    size={88}
                                    radius="9999px"
                                    color="orange"
                                    className="ring-2 ring-white shadow-md shadow-zinc-200/80"
                                >
                                    {initial}
                                </Avatar>
                                <Stack gap={4} align="center" w="100%">
                                    <Text fw={700} size="md" ta="center" lineClamp={2}>
                                        {name}
                                    </Text>
                                    <Text size="xs" c="dimmed" ta="center" lineClamp={2}>
                                        {user.email}
                                    </Text>
                                </Stack>
                                <Button
                                    type="button"
                                    variant="light"
                                    color="orange"
                                    size="xs"
                                    radius="md"
                                    leftSection={<IconPencil size={14} />}
                                    onClick={handleChangePhotoClick}
                                >
                                    {t('profile.changePhoto')}
                                </Button>
                            </Stack>
                        </Paper>

                        <Title order={6} mt="xl" mb="xs" c="dimmed" tt="uppercase" fz={11} fw={700}>
                            {t('profile.accountMenu')}
                        </Title>
                        <Stack gap={4}>
                            {SIDEBAR_LINKS.map(({ href, labelKey, icon: Icon }) => {
                                const active =
                                    pathname === href ||
                                    (href !== '/profile' && pathname.startsWith(href));
                                return (
                                    <NavLink
                                        key={href}
                                        component={Link}
                                        href={href}
                                        label={t(labelKey)}
                                        leftSection={<Icon size={18} stroke={1.75} />}
                                        active={active}
                                        variant="light"
                                        color="orange"
                                        className="font-medium"
                                    />
                                );
                            })}
                        </Stack>

                        <Divider my="md" className="border-zinc-200" />

                        <NavLink
                            component="button"
                            type="button"
                            label={t('common.logout')}
                            leftSection={<IconLogout size={18} stroke={1.75} />}
                            color="red"
                            variant="light"
                            disabled={isLoggingOut}
                            onClick={() => logout()}
                            className="font-medium"
                        />
                    </Box>

                    {/* Main */}
                    <Box className="min-w-0 flex-1 rounded-xl bg-white p-4 sm:p-8 lg:p-10">
                        {children}
                    </Box>
                </Flex>
            </Paper>
        </Container>
    );
}
