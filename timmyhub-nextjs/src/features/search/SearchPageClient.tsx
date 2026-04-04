'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Container, Grid, Paper, Stack, Text, Title, Group, Badge,
    Select, Slider, RangeSlider, Button, Skeleton, Box,
    Divider, Checkbox, ActionIcon, Tooltip, NumberInput,
    SimpleGrid, Pagination, ThemeIcon,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { searchService, type SearchParams } from '@/services/search.service';
import { ProductCard } from '@/features/products/components/ProductCard';
import Iconify from '@/components/iconify/Iconify';
import { formatVND } from '@/utils/currency';
import { SearchBar } from '@/components/common/SearchBar';

interface Props {
    initialParams: {
        q?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        sortBy?: string;
        page?: string;
    };
}

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Liên quan nhất' },
    { value: 'best_selling', label: 'Bán chạy nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
];

const RATING_OPTIONS = [
    { value: 4, label: '4★ trở lên' },
    { value: 3, label: '3★ trở lên' },
    { value: 0, label: 'Tất cả' },
];

export function SearchPageClient({ initialParams }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [params, setParams] = useState<SearchParams>({
        q: initialParams.q ?? '',
        sortBy: (initialParams.sortBy as SearchParams['sortBy']) ?? 'relevance',
        minPrice: initialParams.minPrice ? Number(initialParams.minPrice) : undefined,
        maxPrice: initialParams.maxPrice ? Number(initialParams.maxPrice) : undefined,
        page: initialParams.page ? Number(initialParams.page) : 1,
        limit: 20,
    });

    const [priceRange, setPriceRange] = useState<[number, number]>([
        params.minPrice ?? 0,
        params.maxPrice ?? 50_000_000,
    ]);
    const [minRating, setMinRating] = useState(0);

    // Sync URL → state khi searchParams thay đổi
    useEffect(() => {
        const q = searchParams.get('q') ?? '';
        setParams(prev => ({ ...prev, q, page: 1 }));
    }, [searchParams]);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['search', params],
        queryFn: () => searchService.search({ ...params, minRating: minRating || undefined }),
        staleTime: 30_000,
    });

    const results = data?.data ?? [];
    const meta = data?.meta;
    const categories = data?.aggregations?.categories ?? [];

    const updateParams = (updates: Partial<SearchParams>) => {
        const next = { ...params, ...updates, page: 1 };
        setParams(next);
        // Sync URL
        const url = new URLSearchParams();
        if (next.q) url.set('q', next.q);
        if (next.sortBy && next.sortBy !== 'relevance') url.set('sortBy', next.sortBy);
        if (next.minPrice) url.set('minPrice', String(next.minPrice));
        if (next.maxPrice) url.set('maxPrice', String(next.maxPrice));
        router.push(`/search?${url.toString()}`, { scroll: false });
    };

    const applyPriceFilter = () => {
        updateParams({ minPrice: priceRange[0] || undefined, maxPrice: priceRange[1] >= 50_000_000 ? undefined : priceRange[1] });
    };

    const resetFilters = () => {
        setPriceRange([0, 50_000_000]);
        setMinRating(0);
        setParams(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined, page: 1 }));
    };

    return (
        <Container size="xl" py="lg">
            {/* Search bar lớn ở đầu trang */}
            <Stack gap="lg">
                <Box maw={640} mx="auto" w="100%">
                    <SearchBar />
                </Box>

                {params.q && (
                    <Group gap="xs">
                        <Text c="dimmed" size="sm">Kết quả tìm kiếm cho</Text>
                        <Badge size="lg" variant="light" color="blue">"{params.q}"</Badge>
                        {meta && (
                            <Text c="dimmed" size="sm">
                                — {meta.total.toLocaleString()} sản phẩm
                                {meta.took !== undefined && ` (${meta.took}ms)`}
                            </Text>
                        )}
                    </Group>
                )}

                <Grid gutter="lg">
                    {/* Sidebar filters */}
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Paper withBorder p="md" radius="md">
                            <Group justify="space-between" mb="md">
                                <Group gap="xs">
                                    <ThemeIcon size={24} variant="light" color="blue" radius="sm">
                                        <Iconify icon="solar:filter-bold" width={14} />
                                    </ThemeIcon>
                                    <Text fw={700} size="sm">Bộ lọc</Text>
                                </Group>
                                <Button variant="subtle" size="xs" color="gray" onClick={resetFilters}>
                                    Xóa tất cả
                                </Button>
                            </Group>

                            <Stack gap="lg">
                                {/* Category facets */}
                                {categories.length > 0 && (
                                    <Box>
                                        <Text fw={600} size="sm" mb="xs">Danh mục</Text>
                                        <Stack gap="xs">
                                            {categories.slice(0, 8).map(c => (
                                                <Group key={c.key} justify="space-between">
                                                    <Text size="sm" style={{ cursor: 'pointer' }}
                                                        c={params.category === c.key ? 'blue' : undefined}
                                                        onClick={() => updateParams({ category: params.category === c.key ? undefined : c.key })}
                                                    >
                                                        {c.key}
                                                    </Text>
                                                    <Badge size="xs" variant="light" color="gray">{c.doc_count}</Badge>
                                                </Group>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <Divider />

                                {/* Price range */}
                                <Box>
                                    <Text fw={600} size="sm" mb="md">Khoảng giá</Text>
                                    <RangeSlider
                                        min={0}
                                        max={50_000_000}
                                        step={500_000}
                                        value={priceRange}
                                        onChange={setPriceRange}
                                        label={v => formatVND(v)}
                                        mb="md"
                                    />
                                    <Group gap="xs">
                                        <NumberInput
                                            size="xs"
                                            value={priceRange[0]}
                                            onChange={v => setPriceRange([Number(v) || 0, priceRange[1]])}
                                            min={0}
                                            max={priceRange[1]}
                                            thousandSeparator=","
                                            style={{ flex: 1 }}
                                            placeholder="Từ"
                                        />
                                        <Text size="xs" c="dimmed">—</Text>
                                        <NumberInput
                                            size="xs"
                                            value={priceRange[1]}
                                            onChange={v => setPriceRange([priceRange[0], Number(v) || 50_000_000])}
                                            min={priceRange[0]}
                                            max={50_000_000}
                                            thousandSeparator=","
                                            style={{ flex: 1 }}
                                            placeholder="Đến"
                                        />
                                    </Group>
                                    <Button size="xs" fullWidth mt="sm" variant="light" onClick={applyPriceFilter}>
                                        Áp dụng
                                    </Button>
                                </Box>

                                <Divider />

                                {/* Rating */}
                                <Box>
                                    <Text fw={600} size="sm" mb="xs">Đánh giá</Text>
                                    <Stack gap="xs">
                                        {RATING_OPTIONS.map(opt => (
                                            <Group key={opt.value} gap="xs" style={{ cursor: 'pointer' }}
                                                onClick={() => setMinRating(opt.value)}>
                                                <Checkbox
                                                    size="xs"
                                                    checked={minRating === opt.value}
                                                    onChange={() => setMinRating(opt.value)}
                                                    readOnly
                                                />
                                                <Group gap={2}>
                                                    {opt.value > 0 && Array.from({ length: opt.value }).map((_, i) => (
                                                        <Iconify key={i} icon="solar:star-bold" width={12} color="#f59e0b" />
                                                    ))}
                                                    <Text size="xs">{opt.label}</Text>
                                                </Group>
                                            </Group>
                                        ))}
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* Results */}
                    <Grid.Col span={{ base: 12, md: 9 }}>
                        <Stack gap="md">
                            {/* Sort bar */}
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    {isLoading ? 'Đang tìm...' : meta ? `${meta.total.toLocaleString()} kết quả` : ''}
                                </Text>
                                <Group gap="sm">
                                    {isFetching && !isLoading && (
                                        <Iconify icon="solar:refresh-bold" width={16}
                                            style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />
                                    )}
                                    <Select
                                        size="xs"
                                        w={180}
                                        value={params.sortBy ?? 'relevance'}
                                        onChange={v => updateParams({ sortBy: v as SearchParams['sortBy'] })}
                                        data={SORT_OPTIONS}
                                        leftSection={<Iconify icon="solar:sort-bold" width={14} />}
                                    />
                                </Group>
                            </Group>

                            {/* Active filters */}
                            {(params.minPrice || params.maxPrice || minRating > 0 || params.category) && (
                                <Group gap="xs">
                                    <Text size="xs" c="dimmed">Đang lọc:</Text>
                                    {params.category && (
                                        <Badge size="sm" variant="light" rightSection={
                                            <Iconify icon="solar:close-circle-bold" width={12} style={{ cursor: 'pointer' }}
                                                onClick={() => updateParams({ category: undefined })} />
                                        }>{params.category}</Badge>
                                    )}
                                    {(params.minPrice || params.maxPrice) && (
                                        <Badge size="sm" variant="light" color="green" rightSection={
                                            <Iconify icon="solar:close-circle-bold" width={12} style={{ cursor: 'pointer' }}
                                                onClick={() => { setPriceRange([0, 50_000_000]); updateParams({ minPrice: undefined, maxPrice: undefined }); }} />
                                        }>
                                            {formatVND(params.minPrice ?? 0)} — {params.maxPrice ? formatVND(params.maxPrice) : 'Max'}
                                        </Badge>
                                    )}
                                    {minRating > 0 && (
                                        <Badge size="sm" variant="light" color="yellow" rightSection={
                                            <Iconify icon="solar:close-circle-bold" width={12} style={{ cursor: 'pointer' }}
                                                onClick={() => setMinRating(0)} />
                                        }>{minRating}★+</Badge>
                                    )}
                                </Group>
                            )}

                            {/* Product grid */}
                            {isLoading ? (
                                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <Skeleton key={i} h={280} radius="md" />
                                    ))}
                                </SimpleGrid>
                            ) : results.length === 0 ? (
                                <Paper withBorder p="xl" radius="md" ta="center">
                                    <ThemeIcon size={64} variant="light" color="gray" radius="xl" mx="auto" mb="md">
                                        <Iconify icon="solar:magnifer-bold" width={32} />
                                    </ThemeIcon>
                                    <Title order={4} mb="xs">Không tìm thấy kết quả</Title>
                                    <Text c="dimmed" size="sm">
                                        Thử tìm với từ khóa khác hoặc bỏ bớt bộ lọc
                                    </Text>
                                    <Button mt="md" variant="light" onClick={resetFilters}>
                                        Xóa bộ lọc
                                    </Button>
                                </Paper>
                            ) : (
                                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
                                    {results.map(p => (
                                        <ProductCard
                                            key={p.id}
                                            product={p as Parameters<typeof ProductCard>[0]['product']}
                                            highlight={p.highlight?.name?.[0]}
                                        />
                                    ))}
                                </SimpleGrid>
                            )}

                            {/* Pagination */}
                            {meta && meta.totalPages > 1 && (
                                <Group justify="center" mt="md">
                                    <Pagination
                                        total={meta.totalPages}
                                        value={params.page ?? 1}
                                        onChange={p => setParams(prev => ({ ...prev, page: p }))}
                                        radius="md"
                                    />
                                </Group>
                            )}
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Stack>
        </Container>
    );
}
