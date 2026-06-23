'use client';

/**
 * Chân trang riêng của trang gian hàng (liên kết hardcode / placeholder).
 */
import type { ReactElement, ReactNode } from 'react';
import { Container, Divider, Grid, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface SellerShopFooterProps {
    shopName: string;
}

export function SellerShopFooter({ shopName }: SellerShopFooterProps): React.ReactElement {
    const { t } = useTranslation('common');
    const year = new Date().getFullYear();

    return (
        <footer
            suppressHydrationWarning
            className="mt-12 border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900"
        >
            <Container size="xl">
                <Grid gutter={40}>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Group gap="xs" mb="sm">
                            <ThemeIcon size="md" radius="md" color="blue" variant="filled">
                                <Iconify icon="solar:shop-bold" width={20} />
                            </ThemeIcon>
                            <Text fw={800} size="lg">
                                {shopName}
                            </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                            {t('sellerShop.footerTagline')}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Text fw={800} size="xs" tt="uppercase" className="tracking-widest" mb="md">
                            {t('sellerShop.footerDiscover')}
                        </Text>
                        <Stack gap="xs">
                            <FooterLink href="#">{t('sellerShop.footerDiscoverNew')}</FooterLink>
                            <FooterLink href="#">{t('sellerShop.footerDiscoverHot')}</FooterLink>
                            <FooterLink href="#">{t('sellerShop.footerDiscoverBlog')}</FooterLink>
                            <FooterLink href="#">{t('sellerShop.footerDiscoverCareers')}</FooterLink>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Text fw={800} size="xs" tt="uppercase" className="tracking-widest" mb="md">
                            {t('sellerShop.footerSupport')}
                        </Text>
                        <Stack gap="xs">
                            <FooterLink href="#">{t('sellerShop.footerSupportHelp')}</FooterLink>
                            <FooterLink href="#">{t('sellerShop.footerSupportBuy')}</FooterLink>
                            <FooterLink href="#">{t('sellerShop.footerSupportShip')}</FooterLink>
                            <FooterLink href="#">{t('sellerShop.footerSupportReturn')}</FooterLink>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Text fw={800} size="xs" tt="uppercase" className="tracking-widest" mb="md">
                            {t('sellerShop.footerConnect')}
                        </Text>
                        <Stack gap="sm">
                            <Group gap="xs">
                                <Iconify icon="tabler:world" width={18} className="text-slate-500" />
                                <Text size="sm" c="dimmed">
                                    timmyhub.com
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <Iconify icon="tabler:mail" width={18} className="text-slate-500" />
                                <Text size="sm" c="dimmed">
                                    support@timmyhub.com
                                </Text>
                            </Group>
                            <Group gap="xs">
                                <Iconify icon="tabler:phone" width={18} className="text-slate-500" />
                                <Text size="sm" c="dimmed">
                                    1900 1234
                                </Text>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
                <Divider my="lg" />
                <Text size="sm" c="dimmed" ta="center">
                    {t('sellerShop.footerCopyright', { year })}
                </Text>
            </Container>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }): ReactElement {
    return (
        <Text component={Link} href={href} size="sm" c="dimmed" className="no-underline hover:text-blue-600">
            {children}
        </Text>
    );
}
