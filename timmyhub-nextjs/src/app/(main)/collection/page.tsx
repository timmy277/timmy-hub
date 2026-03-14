'use client';

/**
 * CollectionPage - Trang danh sách sản phẩm với bộ lọc
 * Sidebar: Danh mục, Brand, Khoảng giá, Đánh giá, Nơi bán
 * Top: Tabs + Sort
 */

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Container,
    Grid,
    Stack,
    Group,
    Title,
    Text,
    Box,
    Paper,
    Tabs,
    Button,
    Checkbox,
    RangeSlider,
    Badge,
    Pagination,
    Loader,
    Center,
    useComputedColorScheme,
    Drawer,
    ActionIcon,
    Divider,
    Skeleton,
} from '@mantine/core';
import { IconFilter, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { productService, ProductsResponse, ProductFilterParams } from '@/services/product.service';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { Product, Brand, Seller } from '@/types/product';
import { Category } from '@/types/category';

const PAGE_SIZE = 20;

// Filter Sidebar Component - declared outside to avoid re-creation on render
function FilterSidebar({
    categoryId,
    filteredCategories,
    priceRange,
    setPriceRange,
    brandsData,
    selectedBrands,
    setSelectedBrands,
    selectedRatings,
    setSelectedRatings,
    sellersData,
    selectedSellers,
    setSelectedSellers,
    activeFiltersCount,
    clearFilters,
    handleTabChange,
    updateParams,
}: {
    categoryId: string | null;
    filteredCategories: Category[];
    priceRange: [number, number];
    setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    brandsData: Brand[] | undefined;
    selectedBrands: string[];
    setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
    selectedRatings: number[];
    setSelectedRatings: React.Dispatch<React.SetStateAction<number[]>>;
    sellersData: Seller[] | undefined;
    selectedSellers: string[];
    setSelectedSellers: React.Dispatch<React.SetStateAction<string[]>>;
    activeFiltersCount: number;
    clearFilters: () => void;
    handleTabChange: (tab: string) => void;
    updateParams: (params: Record<string, string | null>) => void;
}) {
    return (
        <Stack gap="lg">
            {/* Categories */}
            <Box>
                <Text fw={600} mb="sm">Danh mục</Text>
                <Stack gap="xs">
                    <Box style={{ cursor: 'pointer' }} onClick={() => handleTabChange('all')}>
                        <Text c={!categoryId ? 'blue' : undefined} fw={!categoryId ? 600 : 400}>
                            Tất cả sản phẩm
                        </Text>
                    </Box>
                    {filteredCategories.map(cat => (
                        <Box
                            key={cat.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTabChange(cat.slug)}
                        >
                            <Text c={categoryId === cat.id ? 'blue' : undefined} fw={categoryId === cat.id ? 600 : 400}>
                                {cat.name}
                            </Text>
                        </Box>
                    ))}
                </Stack>
            </Box>

            <Divider />

            {/* Price Range */}
            <Box>
                <Text fw={600} mb="sm">Khoảng giá</Text>
                <RangeSlider
                    min={0}
                    max={50000000}
                    step={100000}
                    value={priceRange}
                    onChange={setPriceRange}
                    onChangeEnd={(val) => {
                        updateParams({
                            minPrice: val[0] > 0 ? val[0].toString() : null,
                            maxPrice: val[1] < 50000000 ? val[1].toString() : null,
                            page: '1'
                        });
                    }}
                    label={(value) => `${(value / 1000000).toFixed(0)}tr`}
                    mb="md"
                />
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">{(priceRange[0] / 1000000).toFixed(0)}tr</Text>
                    <Text size="sm" c="dimmed">{(priceRange[1] / 1000000).toFixed(0)}tr</Text>
                </Group>
            </Box>

            <Divider />

            {/* Brand */}
            <Box>
                <Text fw={600} mb="sm">Thương hiệu</Text>
                <Stack gap="xs">
                    {(brandsData || []).map(brand => (
                        <Checkbox
                            key={brand.id}
                            label={brand.name}
                            checked={selectedBrands.includes(brand.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedBrands([brand.id]);
                                    updateParams({ brandId: brand.id, page: '1' });
                                } else {
                                    setSelectedBrands([]);
                                    updateParams({ brandId: null, page: '1' });
                                }
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <Divider />

            {/* Rating */}
            <Box>
                <Text fw={600} mb="sm">Đánh giá</Text>
                <Stack gap="xs">
                    {[4, 3, 2, 1].map(rating => (
                        <Box
                            key={rating}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                const newRatings = selectedRatings.includes(rating)
                                    ? selectedRatings.filter(r => r !== rating)
                                    : [rating];
                                setSelectedRatings(newRatings);
                                updateParams({
                                    minRating: newRatings.length > 0 ? Math.min(...newRatings).toString() : null,
                                    page: '1'
                                });
                            }}
                        >
                            <Group gap={4}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Text key={star} c={star <= rating ? 'yellow' : 'gray'} size="sm">★</Text>
                                ))}
                                <Text size="sm" c="dimmed">trở lên</Text>
                            </Group>
                        </Box>
                    ))}
                </Stack>
            </Box>

            <Divider />

            {/* Seller / Nơi bán */}
            <Box>
                <Text fw={600} mb="sm">Nơi bán</Text>
                <Stack gap="xs">
                    {(sellersData || []).slice(0, 10).map(seller => (
                        <Checkbox
                            key={seller.id}
                            label={seller.shopName || seller.email}
                            checked={selectedSellers.includes(seller.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedSellers([seller.id]);
                                    updateParams({ sellerId: seller.id, page: '1' });
                                } else {
                                    setSelectedSellers([]);
                                    updateParams({ sellerId: null, page: '1' });
                                }
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            {activeFiltersCount > 0 && (
                <>
                    <Divider />
                    <Button variant="subtle" color="red" onClick={clearFilters}>
                        Xóa tất cả bộ lọc
                    </Button>
                </>
            )}
        </Stack>
    );
}

// Main content component
function CollectionPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    // Parse URL params
    const currentPage = parseInt(searchParams.get('page') || '1');
    const categoryId = searchParams.get('categoryId') || undefined;
    const brandId = searchParams.get('brandId') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const sort = (searchParams.get('sort') as ProductFilterParams['sort']) || 'newest';

    // Local state
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([minPrice || 0, maxPrice || 50000000]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>(brandId ? [brandId] : []);
    const [selectedSellers, setSelectedSellers] = useState<string[]>(sellerId ? [sellerId] : []);
    const [selectedRatings, setSelectedRatings] = useState<number[]>(minRating ? [minRating] : []);
    const [sortOption, setSortOption] = useState(sort || 'newest');

    // Fetch products with filters
    const { data, isLoading } = useQuery({
        queryKey: ['products', 'filter', currentPage, categoryId, brandId, minPrice, maxPrice, minRating, sellerId, sort],
        queryFn: async () => {
            const params: ProductFilterParams = {
                page: currentPage,
                limit: PAGE_SIZE,
                sort: sortOption,
            };
            if (categoryId) params.categoryId = categoryId;
            if (selectedBrands.length > 0) params.brandId = selectedBrands[0];
            if (priceRange[0] > 0) params.minPrice = priceRange[0];
            if (priceRange[1] < 50000000) params.maxPrice = priceRange[1];
            if (selectedRatings.length > 0) params.minRating = Math.min(...selectedRatings);
            if (selectedSellers.length > 0) params.sellerId = selectedSellers[0];

            const res = await productService.getProductsWithFilters(params);
            return res.data as ProductsResponse;
        },
    });

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'all'],
        queryFn: async () => {
            const res = await productService.getCategories();
            return res.data as Category[];
        },
    });

    // Fetch brands
    const { data: brandsData } = useQuery({
        queryKey: ['brands', 'all'],
        queryFn: async () => {
            const res = await productService.getBrands();
            return res.data;
        },
    });

    // Fetch sellers (nơi bán)
    const { data: sellersData } = useQuery({
        queryKey: ['sellers', 'all'],
        queryFn: async () => {
            const res = await productService.getSellers();
            return res.data;
        },
    });

    // Helper to update URL
    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`/collection?${params.toString()}`);
    };

    // Handle tab change
    const handleTabChange = (tab: string | null) => {
        if (tab === 'all') {
            updateParams({ categoryId: null, tab: null });
        } else if (tab) {
            const category = categoriesData?.find(c => c.slug === tab);
            if (category) {
                updateParams({ categoryId: category.id, tab: null });
            }
        }
    };

    // Handle sort change
    const handleSortChange = (newSort: string) => {
        const validSort: ProductFilterParams['sort'] = newSort as ProductFilterParams['sort'];
        setSortOption(validSort ?? 'newest');
        updateParams({ sort: newSort, page: '1' });
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        updateParams({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get current category name
    const currentCategory = useMemo(() => {
        if (!categoryId || !categoriesData) return null;
        return categoriesData.find(c => c.id === categoryId);
    }, [categoryId, categoriesData]);

    // Filter options based on tab
    const filteredCategories = useMemo(() => {
        return categoriesData || [];
    }, [categoriesData]);

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedBrands.length > 0) count++;
        if (priceRange[0] > 0 || priceRange[1] < 50000000) count++;
        if (selectedRatings.length > 0) count++;
        if (selectedSellers.length > 0) count++;
        if (categoryId) count++;
        return count;
    }, [selectedBrands, priceRange, selectedRatings, selectedSellers, categoryId]);

    // Clear all filters
    const clearFilters = () => {
        setSelectedBrands([]);
        setSelectedSellers([]);
        setSelectedRatings([]);
        setPriceRange([0, 50000000]);
        router.push('/collection');
    };

    return (
        <Container size="xl" py="lg">
            <Grid gutter="xl">
                {/* Desktop Sidebar */}
                <Grid.Col span={{ base: 0, md: 3 }} visibleFrom="md">
                    <Paper p="md" radius="md" bg={isDark ? 'gray.9' : 'gray.0'}>
                        <FilterSidebar
                            categoryId={categoryId || null}
                            filteredCategories={filteredCategories}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            brandsData={brandsData}
                            selectedBrands={selectedBrands}
                            setSelectedBrands={setSelectedBrands}
                            selectedRatings={selectedRatings}
                            setSelectedRatings={setSelectedRatings}
                            sellersData={sellersData}
                            selectedSellers={selectedSellers}
                            setSelectedSellers={setSelectedSellers}
                            activeFiltersCount={activeFiltersCount}
                            clearFilters={clearFilters}
                            handleTabChange={handleTabChange}
                            updateParams={updateParams}
                        />
                    </Paper>
                </Grid.Col>

                {/* Mobile Filter Drawer */}
                <Drawer
                    opened={mobileFiltersOpen}
                    onClose={() => setMobileFiltersOpen(false)}
                    title="Bộ lọc"
                    size="sm"
                >
                    <FilterSidebar
                        categoryId={categoryId || null}
                        filteredCategories={filteredCategories}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        brandsData={brandsData}
                        selectedBrands={selectedBrands}
                        setSelectedBrands={setSelectedBrands}
                        selectedRatings={selectedRatings}
                        setSelectedRatings={setSelectedRatings}
                        sellersData={sellersData}
                        selectedSellers={selectedSellers}
                        setSelectedSellers={setSelectedSellers}
                        activeFiltersCount={activeFiltersCount}
                        clearFilters={clearFilters}
                        handleTabChange={handleTabChange}
                        updateParams={updateParams}
                    />
                </Drawer>

                {/* Main Content */}
                <Grid.Col span={{ base: 12, md: 9 }}>
                    <Stack gap="md">
                        {/* Header */}
                        <Paper p="md" radius="md" bg={isDark ? 'gray.9' : 'gray.0'}>
                            <Group justify="space-between" wrap="wrap" gap="sm">
                                <Box>
                                    <Title order={2}>
                                        {currentCategory ? currentCategory.name : 'Tất cả sản phẩm'}
                                    </Title>
                                    {data?.meta && (
                                        <Text c="dimmed" size="sm">
                                            {data.meta.total} sản phẩm
                                        </Text>
                                    )}
                                </Box>

                                <Group>
                                    <ActionIcon
                                        variant="outline"
                                        size="lg"
                                        hiddenFrom="md"
                                        onClick={() => setMobileFiltersOpen(true)}
                                    >
                                        <IconFilter size={20} />
                                    </ActionIcon>

                                    <Tabs value={sortOption} onChange={(val) => val && handleSortChange(val)}>
                                        <Tabs.List>
                                            <Tabs.Tab value="newest">Mới nhất</Tabs.Tab>
                                            <Tabs.Tab value="best_selling">Bán chạy</Tabs.Tab>
                                            <Tabs.Tab value="price_asc">Giá thấp-cao</Tabs.Tab>
                                            <Tabs.Tab value="price_desc">Giá cao-thấp</Tabs.Tab>
                                            <Tabs.Tab value="rating">Đánh giá</Tabs.Tab>
                                        </Tabs.List>
                                    </Tabs>
                                </Group>
                            </Group>

                            {/* Active Filters Tags */}
                            {activeFiltersCount > 0 && (
                                <Group mt="md" gap="xs">
                                    {categoryId && currentCategory && (
                                        <Badge variant="light" rightSection={
                                            <IconX size={12} style={{ cursor: 'pointer' }} onClick={() => handleTabChange('all')} />
                                        }>
                                            {currentCategory.name}
                                        </Badge>
                                    )}
                                    {selectedBrands.map(brandId => {
                                        const brand = (brandsData || []).find(b => b.id === brandId);
                                        return brand ? (
                                            <Badge key={brandId} variant="light" rightSection={
                                                <IconX size={12} style={{ cursor: 'pointer' }} onClick={() => {
                                                    setSelectedBrands([]);
                                                    updateParams({ brandId: null, page: '1' });
                                                }} />
                                            }>
                                                {brand.name}
                                            </Badge>
                                        ) : null;
                                    })}
                                    {(priceRange[0] > 0 || priceRange[1] < 50000000) && (
                                        <Badge variant="light" rightSection={
                                            <IconX size={12} style={{ cursor: 'pointer' }} onClick={() => {
                                                setPriceRange([0, 50000000]);
                                                updateParams({ minPrice: null, maxPrice: null, page: '1' });
                                            }} />
                                        }>
                                            {(priceRange[0] / 1000000).toFixed(0)}tr - {(priceRange[1] / 1000000).toFixed(0)}tr
                                        </Badge>
                                    )}
                                </Group>
                            )}
                        </Paper>

                        {/* Product Grid */}
                        {isLoading ? (
                            <Center p="xl">
                                <Loader size="lg" />
                            </Center>
                        ) : data?.data && data.data.length > 0 ? (
                            <>
                                <ProductGrid products={data.data as Product[]} viewMode="grid" isLoading={isLoading} />
                                {data.meta.totalPages > 1 && (
                                    <Center mt="xl">
                                        <Pagination total={data.meta.totalPages} value={currentPage} onChange={handlePageChange} size="md" />
                                    </Center>
                                )}
                            </>
                        ) : (
                            <Paper p="xl" radius="md" ta="center" bg={isDark ? 'gray.9' : 'gray.0'}>
                                <Text c="dimmed">Không có sản phẩm nào phù hợp với bộ lọc của bạn</Text>
                                <Button mt="md" variant="subtle" onClick={clearFilters}>
                                    Xóa bộ lọc
                                </Button>
                            </Paper>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}

// Main page component with Suspense
export default function CollectionPage() {
    return (
        <Suspense fallback={
            <Container size="xl" py="lg">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 0, md: 3 }} visibleFrom="md">
                        <Stack gap="lg">
                            <Skeleton height={200} radius="md" />
                            <Skeleton height={300} radius="md" />
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 9 }}>
                        <Stack gap="md">
                            <Skeleton height={80} radius="md" />
                            <Skeleton height={400} radius="md" />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>
        }>
            <CollectionPageContent />
        </Suspense>
    );
}
