'use client';

import { Card, Group, Image, Text, Box, Anchor, Stack, Progress, Badge } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatVND } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from '@/components/ClientOnly';

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list' | 'flash-sale';
    hideAddToCart?: boolean;
    highlight?: string;
}

export function ProductCard(props: ProductCardProps) {
    return (
        <ClientOnly fallback={<Box h={300} style={{ background: 'var(--mantine-color-gray-1)', borderRadius: 12 }} />}>
            <ProductCardInner {...props} />
        </ClientOnly>
    );
}

function ProductCardInner({ product, viewMode = 'grid', highlight }: ProductCardProps) {
    const { t } = useTranslation('common');
    const discountPercentage = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;
    const soldPercentage = product.stock > 0
        ? Math.min((product.soldCount / (product.soldCount + product.stock)) * 100, 100)
        : 100;
    const productLink = `/product/${product.slug}`;

    // ── Flash Sale ──────────────────────────────────────────────────────────
    if (viewMode === 'flash-sale') {
        return (
            <m.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
                <Card padding="xs" radius={12} withBorder={false} h="100%"
                    style={{ position: 'relative', boxShadow: '0 1px 3px rgba(145,158,171,0.16)', cursor: 'pointer' }}>
                    <Link href={productLink} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-label={product.name} />
                    <Box pos="relative" style={{ aspectRatio: '1/1', overflow: 'hidden', borderRadius: 8, background: '#f4f6f8' }}>
                        <Image src={product.images[0] || '/placeholder-product.jpg'} w="100%" h="100%" fit="cover" alt={product.name} />
                        {discountPercentage > 0 && (
                            <Box pos="absolute" top={6} left={6}
                                style={{ background: '#ff3030', color: '#fff', fontWeight: 700, fontSize: 11, padding: '2px 7px', borderRadius: 5 }}>
                                -{discountPercentage}%
                            </Box>
                        )}
                    </Box>
                    <Stack gap={4} mt={8}>
                        <Text size="sm" lineClamp={2} fw={600} style={{ color: '#1c252e', minHeight: 40 }}>{product.name}</Text>
                        <Text size="md" fw={800} style={{ color: '#ff3030' }}>{formatVND(product.price)}</Text>
                        {product.originalPrice && (
                            <Text size="xs" td="line-through" style={{ color: '#919eab' }}>{formatVND(product.originalPrice)}</Text>
                        )}
                        <Stack gap={2} mt={4}>
                            <Group justify="space-between">
                                <Text size="xs" style={{ color: '#ff3030' }} fw={600}>
                                    {t('product.soldCount', { count: product.soldCount })}
                                </Text>
                                <Iconify icon="solar:fire-bold" width={13} color="#ff6b00" />
                            </Group>
                            <Progress value={soldPercentage} color="red" size="sm" radius="xl" />
                        </Stack>
                    </Stack>
                </Card>
            </m.div>
        );
    }

    // ── List ─────────────────────────────────────────────────────────────────
    if (viewMode === 'list') {
        return (
            <Card padding={0} radius={12} withBorder={false}
                style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(145,158,171,0.16)', cursor: 'pointer' }}>
                <Link href={productLink} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-label={product.name} />
                <Group gap={0} align="stretch" wrap="nowrap">
                    <Box style={{ width: 160, flexShrink: 0, aspectRatio: '1/1', overflow: 'hidden', background: '#f4f6f8' }}>
                        <Image src={product.images[0] || '/placeholder-product.jpg'} w={160} h="100%" fit="cover" alt={product.name} style={{ display: 'block' }} />
                    </Box>
                    <Box p={14} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <Text size="xs" fw={600} style={{ color: '#637381', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                            {product.category?.name || t('product.uncategorized')}
                        </Text>
                        <Anchor component={Link} href={productLink} underline="never" c="inherit" style={{ position: 'relative', zIndex: 1 }}>
                            <Text fw={600} size="sm" style={{ color: '#1c252e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.name}>
                                {product.name}
                            </Text>
                        </Anchor>
                        <Group gap={3} align="center">
                            <Iconify icon="solar:star-bold" width={12} color="#ffab00" />
                            <Text size="xs" fw={600} style={{ color: '#1c252e' }}>{product.ratingAvg.toFixed(1)}</Text>
                            <Text size="xs" style={{ color: '#919eab' }}>({product.ratingCount})</Text>
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={2} style={{ flex: 1 }}>{product.description || ''}</Text>
                        <Box mt="auto">
                            <Text fw={800} size="md" style={{ color: '#0c68e9' }}>{formatVND(product.price)}</Text>
                            {product.originalPrice && (
                                <Text size="xs" td="line-through" style={{ color: '#919eab' }}>{formatVND(product.originalPrice)}</Text>
                            )}
                        </Box>
                    </Box>
                </Group>
            </Card>
        );
    }

    // ── Grid (default) ───────────────────────────────────────────────────────
    return (
        <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
            <Card padding={0} radius={12} withBorder={false} h="100%"
                style={{
                    position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    background: 'var(--mantine-color-body)',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 1px 3px rgba(145,158,171,0.16)',
                }}>
                <Link href={productLink} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-label={product.name} />

                {/* Image */}
                <Box pos="relative" style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#f4f6f8' }}>
                    <Image src={product.images[0] || '/placeholder-product.jpg'} w="100%" h="100%" fit="cover" alt={product.name} style={{ display: 'block' }} />
                    {discountPercentage > 0 && (
                        <Box pos="absolute" top={8} left={8}
                            style={{ background: '#ff3030', color: '#fff', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>
                            -{discountPercentage}%
                        </Box>
                    )}
                    {product.isNew && (
                        <Box pos="absolute" top={8} right={8}
                            style={{ background: '#00a76f', color: '#fff', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 6 }}>
                            NEW
                        </Box>
                    )}
                </Box>

                {/* Content */}
                <Box p={12} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text size="xs" fw={600}
                        style={{ color: '#637381', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                        {product.category?.name || t('product.uncategorized')}
                    </Text>
                    <Anchor component={Link} href={productLink} underline="never" c="inherit" style={{ position: 'relative', zIndex: 1 }}>
                        <Text fw={600} size="sm"
                            style={{ color: '#1c252e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={product.name}>
                            {highlight ? <span dangerouslySetInnerHTML={{ __html: highlight }} /> : product.name}
                        </Text>
                    </Anchor>
                    <Group justify="space-between" align="flex-end" mt="auto">
                        <Box style={{ width: '100%' }}>
                            <Group justify="space-between" align="center">
                                <Text fw={800} size="md" style={{ color: '#0c68e9', lineHeight: 1.2 }}>{formatVND(product.price)}</Text>
                                <Group gap={3} align="center">
                                    <Iconify icon="solar:star-bold" width={12} color="#ffab00" />
                                    <Text size="xs" fw={600} style={{ color: '#1c252e' }}>{product.ratingAvg.toFixed(1)}</Text>
                                    <Text size="xs" style={{ color: '#919eab' }}>({product.ratingCount})</Text>
                                </Group>
                            </Group>
                            <Group justify="space-between" align="center">
                                {product.originalPrice ? (
                                    <Text size="xs" td="line-through" style={{ color: '#919eab' }}>{formatVND(product.originalPrice)}</Text>
                                ) : <span />}
                                <Text size="xs" style={{ color: '#637381' }}>Đã bán {product.soldCount}</Text>
                            </Group>
                        </Box>
                    </Group>
                    {product.stock === 0 && (
                        <Text size="xs" fw={600} style={{ color: '#ff3030' }}>{t('product.outOfStock')}</Text>
                    )}
                </Box>
            </Card>
        </m.div>
    );
}
