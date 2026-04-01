'use client';

import { Title, Text, Container, Paper, Stack, Group, Card, SimpleGrid, Alert } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { sellerService } from '@/services/seller.service';
import { QUERY_KEYS } from '@/constants';
import { useTranslation } from 'react-i18next';

export function SellerDashboard() {
    const { t } = useTranslation();
    const { data: checkRes } = useQuery({
        queryKey: QUERY_KEYS.SELLER_PROFILE_CHECK,
        queryFn: () => sellerService.checkProfile(),
    });
    const { data: profileRes } = useQuery({
        queryKey: QUERY_KEYS.SELLER_PROFILE,
        queryFn: () => sellerService.getProfile(),
        enabled: checkRes?.data?.status === 'APPROVED',
    });
    const shop = profileRes?.data ?? checkRes?.data?.profile;
    const status = checkRes?.data?.status;
    const isPending = status === 'PENDING';

    return (
        <Container fluid p="md">
            <Stack gap="lg">
                {isPending && (
                    <Alert icon={<Iconify icon="tabler:info-circle" width={20} />} title={t('seller.pendingApproval', 'Pending Approval')} color="blue" variant="light">
                        {t('seller.pendingApprovalMessage', 'Your seller application is pending approval. Once approved, you can manage products, vouchers and campaigns.')}
                    </Alert>
                )}
                <div>
                    <Title order={2}>{t('seller.dashboard', 'Store Overview')}</Title>
                    <Text c="dimmed" size="sm" mt={4}>
                        {shop?.shopName && `${t('seller.welcome', 'Welcome')}, ${shop.shopName}`}
                    </Text>
                </div>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <Card
                        component={Link}
                        href="/seller/products"
                        withBorder
                        padding="lg"
                        radius="md"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Group>
                            <Iconify icon="tabler:package" width={32} stroke={1.5} />
                            <div>
                                <Text fw={600}>{t('seller.products')}</Text>
                                <Text size="xs" c="dimmed">
                                    {t('seller.manageProducts')}
                                </Text>
                            </div>
                        </Group>
                    </Card>
                    <Card
                        component={Link}
                        href="/seller/vouchers"
                        withBorder
                        padding="lg"
                        radius="md"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Group>
                            <Iconify icon="tabler:ticket" width={32} stroke={1.5} />
                            <div>
                                <Text fw={600}>{t('seller.vouchers')}</Text>
                                <Text size="xs" c="dimmed">
                                    {t('seller.manageVouchers')}
                                </Text>
                            </div>
                        </Group>
                    </Card>
                    <Card
                        component={Link}
                        href="/seller/campaigns"
                        withBorder
                        padding="lg"
                        radius="md"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Group>
                            <Iconify icon="tabler:discount" width={32} stroke={1.5} />
                            <div>
                                <Text fw={600}>{t('seller.campaigns')}</Text>
                                <Text size="xs" c="dimmed">
                                    {t('seller.manageCampaigns')}
                                </Text>
                            </div>
                        </Group>
                    </Card>
                </SimpleGrid>

                <Paper withBorder p="xl" radius="md">
                    <Title order={4} mb="xs">
                        {t('seller.shopInfo')}
                    </Title>
                    {shop ? (
                        <Stack gap="xs">
                            <Text><strong>{t('seller.shopName')}</strong> {shop.shopName}</Text>
                            <Text><strong>{t('seller.shopSlug')}</strong> {shop.shopSlug}</Text>
                            {shop.description && (
                                <Text><strong>{t('seller.shopDescription')}</strong> {shop.description}</Text>
                            )}
                        </Stack>
                    ) : (
                        <Text c="dimmed">{t('common.loading')}</Text>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
