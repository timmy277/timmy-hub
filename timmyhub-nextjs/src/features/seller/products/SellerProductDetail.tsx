'use client';

/**
 * Chi tiết sản phẩm trong tab của Seller
 */
import {
    Stack,
    Group,
    Text,
    Badge,
    Paper,
    SimpleGrid,
    Image,
    Alert,
} from '@mantine/core';
import NextImage from 'next/image';
import Iconify from '@/components/iconify/Iconify';
import { Product, ResourceStatus } from '@/types/product';
import { formatDate } from '@/utils/date';
import { formatVND } from '@/utils/currency';
import { PRODUCT_STATUS_CONFIG } from '@/constants';
import { useTranslation } from 'react-i18next';

interface Props {
    product: Product;
}

export function SellerProductDetail({ product }: Props) {
    const { t } = useTranslation('common');
    const statusCfg = PRODUCT_STATUS_CONFIG[product.status] ?? { color: 'gray', label: product.status };

    return (
        <Stack gap="md" p="md">
            {product.status === ResourceStatus.REJECTED && product.reviewNote && (
                <Alert icon={<Iconify icon="tabler:info-circle" width={18} />} color="red" variant="light" title={t('seller.rejectionReason')}>
                    {product.reviewNote}
                </Alert>
            )}

            <Group align="flex-start" gap="xl">
                {/* Ảnh sản phẩm */}
                <Paper withBorder radius="md" p="xs">
                    <Image
                        component={NextImage}
                        src={product.images?.[0] || ''}
                        width={120}
                        height={120}
                        radius="md"
                        fallbackSrc="https://placehold.co/120x120?text=SP"
                        fit="cover"
                        alt={product.name}
                    />
                </Paper>

                {/* Thông tin cơ bản */}
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="sm">
                        <Text fw={700} size="lg">{product.name}</Text>
                        <Badge color={statusCfg.color} variant="light" size="md">
                            {statusCfg.label}
                        </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">Slug: {product.slug}</Text>
                    {product.sku && <Text size="sm" c="dimmed">SKU: {product.sku}</Text>}
                    {product.description && (
                        <Text size="sm" lineClamp={3}>{product.description}</Text>
                    )}
                </Stack>
            </Group>

            {/* Thống kê */}
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                <Paper withBorder p="sm" radius="md" ta="center">
                    <Text size="xl" fw={700} c="red">
                        {formatVND(Number(product.price))}
                    </Text>
                    <Text size="xs" c="dimmed">Giá bán</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md" ta="center">
                    <Text size="xl" fw={700} c={product.stock < 10 ? 'red' : 'green'}>
                        {product.stock}
                    </Text>
                    <Text size="xs" c="dimmed">Tồn kho</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md" ta="center">
                    <Text size="xl" fw={700}>{product.soldCount || 0}</Text>
                    <Text size="xs" c="dimmed">Đã bán</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md" ta="center">
                    <Text size="xl" fw={700}>{product.viewCount || 0}</Text>
                    <Text size="xs" c="dimmed">Lượt xem</Text>
                </Paper>
            </SimpleGrid>

            {/* Meta */}
            <Group gap="xl">
                <Text size="sm" c="dimmed">
                    Ngày đăng: <Text span fw={500}>{formatDate(product.createdAt)}</Text>
                </Text>
                <Text size="sm" c="dimmed">
                    Cập nhật: <Text span fw={500}>{formatDate(product.updatedAt)}</Text>
                </Text>
            </Group>
        </Stack>
    );
}
