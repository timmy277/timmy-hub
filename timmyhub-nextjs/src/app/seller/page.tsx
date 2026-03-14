'use client';

import { Title, Text, Container, Paper, Stack, Group, Card, SimpleGrid, Alert } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { sellerService } from '@/services/seller.service';
import { QUERY_KEYS } from '@/constants';

export default function SellerDashboardPage() {
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
                    <Alert icon={<Iconify icon="tabler:info-circle" width={20} />} title="Đang chờ duyệt" color="blue" variant="light">
                        Đơn đăng ký gian hàng của bạn đang chờ admin duyệt. Sau khi được duyệt bạn có thể quản lý sản phẩm, voucher và campaign.
                    </Alert>
                )}
                <div>
                    <Title order={2}>Tổng quan gian hàng</Title>
                    <Text c="dimmed" size="sm" mt={4}>
                        {shop?.shopName && `Xin chào, ${shop.shopName}`}
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
                                <Text fw={600}>Sản phẩm</Text>
                                <Text size="xs" c="dimmed">
                                    Quản lý sản phẩm của gian hàng
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
                                <Text fw={600}>Voucher</Text>
                                <Text size="xs" c="dimmed">
                                    Tạo và quản lý mã giảm giá
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
                                <Text fw={600}>Chương trình khuyến mãi</Text>
                                <Text size="xs" c="dimmed">
                                    Tạo campaign và gắn voucher
                                </Text>
                            </div>
                        </Group>
                    </Card>
                </SimpleGrid>

                <Paper withBorder p="xl" radius="md">
                    <Title order={4} mb="xs">
                        Thông tin gian hàng
                    </Title>
                    {shop ? (
                        <Stack gap="xs">
                            <Text><strong>Tên gian hàng:</strong> {shop.shopName}</Text>
                            <Text><strong>Slug:</strong> {shop.shopSlug}</Text>
                            {shop.description && (
                                <Text><strong>Mô tả:</strong> {shop.description}</Text>
                            )}
                        </Stack>
                    ) : (
                        <Text c="dimmed">Đang tải...</Text>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
