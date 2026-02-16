'use client';

import {
    Badge,
    Group,
    Text,
    Stack,
    Title,
    Card,
    Divider,
    SimpleGrid,
    Image,
    ScrollArea,
    Box,
    Grid,
    Table,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { 
    IconStar, 
    IconTruck, 
    IconBox, 
    IconListDetails,
    IconTag
} from '@tabler/icons-react';
import { Product, ResourceStatus } from '@/types/product';
import { formatDate } from '@/utils/date';

interface ProductDetailProps {
    product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const { t } = useTranslation();

    const renderInfoRow = (label: string, value: string | React.ReactNode) => (
        <Group wrap="nowrap">
            <Text fw={500} w={140} style={{ flexShrink: 0 }} c="dimmed" size="sm">
                {label}:
            </Text>
            <Box style={{ wordBreak: 'break-word' }}>
                <Text size="sm">{value}</Text>
            </Box>
        </Group>
    );

    const statusConfig = {
        [ResourceStatus.PENDING]: { color: 'yellow', label: t('table.status.pending') },
        [ResourceStatus.APPROVED]: { color: 'green', label: t('table.status.approved') },
        [ResourceStatus.REJECTED]: { color: 'red', label: t('table.status.rejected') },
        [ResourceStatus.DELETED]: { color: 'gray', label: t('table.status.deleted') },
    };

    const currentStatus = statusConfig[product.status as ResourceStatus] || {
        color: 'gray',
        label: product.status,
    };

    return (
        <Stack gap="xl" mt="md">
            {/* Header section with Stats */}
            <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                    <Title order={3}>{product.name}</Title>
                    <Group gap="md">
                        <Badge color={currentStatus.color} variant="dot">
                            {currentStatus.label}
                        </Badge>
                        <Text size="xs" c="dimmed">SKU: {product.sku || 'N/A'}</Text>
                        {product.isFeatured && <Badge color="orange" size="xs">Featured</Badge>}
                        {product.isNew && <Badge color="blue" size="xs">New</Badge>}
                    </Group>
                </Stack>
                
                <Group gap="xl">
                    <Stack gap={0} align="center">
                        <Group gap={4}>
                            <IconStar size={14} color="var(--mantine-color-yellow-6)" fill="var(--mantine-color-yellow-6)" />
                            <Text fw={700}>{product.ratingAvg || '0.0'}</Text>
                        </Group>
                        <Text size="xs" c="dimmed">{product.ratingCount || 0} {t('table.columns.rating')}</Text>
                    </Stack>
                    <Divider orientation="vertical" />
                    <Stack gap={0} align="center">
                        <Text fw={700}>{product.soldCount || 0}</Text>
                        <Text size="xs" c="dimmed">{t('table.columns.soldCount')}</Text>
                    </Stack>
                    <Divider orientation="vertical" />
                    <Stack gap={0} align="center">
                        <Text fw={700}>{product.viewCount || 0}</Text>
                        <Text size="xs" c="dimmed">{t('table.columns.viewCount')}</Text>
                    </Stack>
                </Group>
            </Group>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 5 }}>
                    {/* Image Gallery */}
                    <Stack gap="xs">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                radius="md"
                                h={400}
                                fallbackSrc="https://placehold.co/600x600?text=No+Image"
                                alt={product.name}
                            />
                        ) : (
                            <Card withBorder h={400} radius="md" flex={1}>
                                <Stack align="center" justify="center" h="100%">
                                    <IconBox size={40} color="gray" />
                                    <Text c="dimmed">{t('common.noImage')}</Text>
                                </Stack>
                            </Card>
                        )}
                        
                        {product.images && product.images.length > 1 && (
                            <ScrollArea offsetScrollbars>
                                <Group wrap="nowrap" gap="xs">
                                    {product.images.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={img}
                                            w={80}
                                            h={80}
                                            radius="sm"
                                            style={{ cursor: 'pointer', border: idx === 0 ? '2px solid var(--mantine-color-blue-6)' : 'none' }}
                                            alt={`${product.name} ${idx + 1}`}
                                        />
                                    ))}
                                </Group>
                            </ScrollArea>
                        )}
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Stack gap="xl">
                        {/* Pricing Card */}
                        <Card shadow="none" withBorder p="xl" radius="md" bg="var(--mantine-color-gray-0)">
                            <Stack gap="xs">
                                <Group align="flex-end" gap="xs">
                                    <Text size="xl" fw={800} c="red" style={{ fontSize: '1.8rem' }}>
                                        {Number(product.price).toLocaleString()} ₫
                                    </Text>
                                    {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                        <>
                                            <Text size="sm" c="dimmed" td="line-through">
                                                {Number(product.originalPrice).toLocaleString()} ₫
                                            </Text>
                                            <Badge color="red" variant="filled">
                                                -{product.discount}%
                                            </Badge>
                                        </>
                                    )}
                                </Group>
                                <Text size="xs" c="dimmed">Giá đã bao gồm VAT</Text>
                            </Stack>
                        </Card>

                        {/* Variants Section */}
                        {product.variants && product.variants.length > 0 && (
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <IconTag size={18} />
                                    <Text fw={700}>{t('table.columns.variants')}</Text>
                                </Group>
                                <Group gap="sm">
                                    {product.variants.map((v) => (
                                        <Badge key={v.id} variant="outline" color="gray" py="md" px="lg" radius="xs" style={{ cursor: 'pointer' }}>
                                            {v.name}
                                        </Badge>
                                    ))}
                                </Group>
                            </Stack>
                        )}

                        {/* Shipping & Basic Info */}
                        <SimpleGrid cols={2} spacing="lg">
                            <Stack gap="md">
                                <Group gap="xs">
                                    <IconTruck size={18} />
                                    <Text fw={700}>{t('table.columns.dimensions')}</Text>
                                </Group>
                                <Stack gap="xs">
                                    {renderInfoRow(t('table.columns.weight'), `${product.weight || 0} g`)}
                                    {renderInfoRow(t('table.columns.dimensions'), `${product.length || 0} x ${product.width || 0} x ${product.height || 0} cm`)}
                                    {renderInfoRow(t('table.columns.stock'), product.stock)}
                                </Stack>
                            </Stack>

                            <Stack gap="md">
                                <Group gap="xs">
                                    <IconListDetails size={18} />
                                    <Text fw={700}>{t('userManagement.basicInfo')}</Text>
                                </Group>
                                <Stack gap="xs">
                                    {renderInfoRow(t('table.columns.category'), product.category?.name || 'N/A')}
                                    {renderInfoRow(t('table.columns.seller'), product.seller?.profile?.displayName || product.seller?.email || 'N/A')}
                                    {renderInfoRow(t('table.columns.createdAt'), formatDate(product.createdAt))}
                                </Stack>
                            </Stack>
                        </SimpleGrid>

                        {/* Rejected Note */}
                        {product.status === ResourceStatus.REJECTED && product.reviewNote && (
                            <Card withBorder p="md" radius="md" bg="red.0" style={{ borderColor: 'var(--mantine-color-red-2)' }}>
                                <Text fw={700} c="red.9" size="sm" mb={4}>{t('productManagement.rejectReason')}:</Text>
                                <Text size="sm">{product.reviewNote}</Text>
                            </Card>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Detailed Content */}
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="sm">
                        <Group gap="xs">
                            <IconListDetails size={20} />
                            <Text fw={700} size="lg">{t('table.columns.description')}</Text>
                        </Group>
                        <Card withBorder p="xl" radius="md">
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {product.description || 'Không có mô tả cho sản phẩm này.'}
                            </Text>
                        </Card>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="sm">
                        <Group gap="xs">
                            <IconListDetails size={20} />
                            <Text fw={700} size="lg">{t('table.columns.specifications')}</Text>
                        </Group>
                        <Card withBorder p={0} radius="md" style={{ overflow: 'hidden' }}>
                            <Table verticalSpacing="sm">
                                <Table.Tbody>
                                    {product.specifications ? (
                                        Object.entries(product.specifications).map(([key, value]) => (
                                            <Table.Tr key={key}>
                                                <Table.Td fw={500} w={120} bg="var(--mantine-color-gray-0)">
                                                    <Text size="xs" fw={500}>{key}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="xs">{String(value)}</Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <Table.Tr>
                                            <Table.Td ta="center">
                                                <Text size="xs" c="dimmed">Không có thông số kỹ thuật</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Card>

                        {product.attributes && (
                            <Stack gap="xs" mt="md">
                                <Text fw={700} size="sm">{t('table.columns.attributes')}</Text>
                                <Group gap="xs">
                                    {Object.entries(product.attributes).map(([key, value]) => (
                                        <Badge key={key} variant="light" color="cyan" size="sm">
                                            {key}: {String(value)}
                                        </Badge>
                                    ))}
                                </Group>
                            </Stack>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
