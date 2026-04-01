'use client';

import { Container, Text, Group, ActionIcon, Box, Grid, Title, Stack, TextInput, ThemeIcon, useComputedColorScheme } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from '@/components/ClientOnly';
import { BECOME_SELLER_PATH } from '@/constants/become-seller';

export function Footer() {
    const { t } = useTranslation();
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    const FOOTER_LINKS = [
        {
            title: t('footer.about', 'About'),
            links: [
                { label: t('footer.aboutUs', 'About Us'), link: '#' },
                { label: t('footer.careers', 'Careers'), link: '#' },
                { label: t('footer.privacy', 'Privacy Policy'), link: '#' },
                { label: t('footer.terms', 'Terms'), link: '#' },
            ]
        },
        {
            title: t('footer.help', 'Help'),
            links: [
                { label: t('footer.helpCenter', 'Help Center'), link: '#' },
                { label: t('footer.buy', 'How to Buy'), link: '#' },
                { label: t('footer.returns', 'Returns'), link: '#' },
                { label: t('footer.payment', 'Payment Methods'), link: '#' },
                { label: t('footer.shipping', 'Shipping'), link: '#' },
            ]
        },
        {
            title: t('footer.connect', 'Connect'),
            links: [
                { label: t('seller.becomeSeller', 'Sell on TimmyHub'), link: BECOME_SELLER_PATH },
                { label: 'Affiliate Program', link: '#' },
                { label: 'Suppliers', link: '#' },
            ]
        }
    ];

    return (
        <ClientOnly>
            <Box
                component="footer"
                bg={isDark ? 'dark.8' : 'gray.0'}
                pt={80}
                pb={40}
                style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
            >
                <Container size="xl">
                    <Grid gutter={40}>
                        {/* Brand Column */}
                        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                            <Stack gap="lg">
                                <Stack gap={4}>
                                    <Text fw={900} size="32px" style={{ letterSpacing: -1, lineHeight: 1 }}>
                                        TIMMY<Text span c="blue" inherit>HUB</Text>
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {t('home.welcome', 'Welcome to')} TimmyHub - {t('footer.aboutUs', 'The leading e-commerce platform')}
                                    </Text>
                                </Stack>

                                <Stack gap="xs">
                                    <Group gap="xs">
                                        <ThemeIcon variant="light" color="blue" size="md">
                                            <Iconify icon="solar:map-point-bold" width={16} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed">Floor 12, Landmark 81 Building, HCMC</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon variant="light" color="blue" size="md">
                                            <Iconify icon="solar:phone-bold" width={16} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed">1900 1234 (8:00 - 22:00)</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <ThemeIcon variant="light" color="blue" size="md">
                                            <Iconify icon="solar:mail-bold" width={16} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed">support@timmyhub.com</Text>
                                    </Group>
                                </Stack>
                            </Stack>
                        </Grid.Col>

                        {/* Links Columns */}
                        {FOOTER_LINKS.map((group) => (
                            <Grid.Col key={group.title} span={{ base: 6, sm: 4, md: 2, lg: 2 }}>
                                <Title order={5} mb="md">{group.title}</Title>
                                <Stack gap="xs">
                                    {group.links.map((link) => (
                                        <Link key={link.label} href={link.link} style={{ textDecoration: 'none' }}>
                                            <Text size="sm" c="dimmed" style={{ transition: 'color 0.2s' }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--mantine-color-blue-6)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mantine-color-dimmed)')}
                                            >
                                                {link.label}
                                            </Text>
                                        </Link>
                                    ))}
                                </Stack>
                            </Grid.Col>
                        ))}

                        {/* Newsletter Column */}
                        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                            <Title order={5} mb="md">{t('footer.subscribe', 'Subscribe')}</Title>
                            <Stack gap="md">
                                <Text size="sm" c="dimmed">
                                    {t('footer.subscribeDesc', 'Get updates on promotions and discount codes earliest.')}
                                </Text>
                                <Group gap={0}>
                                    <TextInput
                                        placeholder={t('common.email', 'Your email')}
                                        radius="xl"
                                        size="md"
                                        w="100%"
                                        rightSection={
                                            <ActionIcon size={32} radius="xl" color="blue" variant="filled">
                                                <Iconify icon="solar:arrow-right-bold" width={18} />
                                            </ActionIcon>
                                        }
                                        style={{ flex: 1 }}
                                    />
                                </Group>

                                <Title order={6} mt="md">{t('footer.connect', 'Connect with us')}</Title>
                                <Group gap="sm">
                                    <ActionIcon size="lg" color="blue" variant="light" radius="xl">
                                        <Iconify icon="mdi:facebook" width={20} />
                                    </ActionIcon>
                                    <ActionIcon size="lg" color="cyan" variant="light" radius="xl">
                                        <Iconify icon="mdi:twitter" width={20} />
                                    </ActionIcon>
                                    <ActionIcon size="lg" color="red" variant="light" radius="xl">
                                        <Iconify icon="mdi:youtube" width={20} />
                                    </ActionIcon>
                                    <ActionIcon size="lg" color="pink" variant="light" radius="xl">
                                        <Iconify icon="mdi:instagram" width={20} />
                                    </ActionIcon>
                                </Group>
                            </Stack>
                        </Grid.Col>
                    </Grid>

                    {/* Copyright */}
                    <Text size="sm" c="dimmed" ta="center" mt={40}>
                        {t('footer.copyright', '© 2024 TimmyHub. All rights reserved.')}
                    </Text>
                </Container>
            </Box>
        </ClientOnly>
    );
}
