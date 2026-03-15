'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    Modal,
    Group,
    Button,
    Stack,
    TextInput,
    Select,
    Checkbox,
    Table,
    Badge,
    Text,
    Box,
    Pagination,
    NumberInput,
    ActionIcon,
    Tooltip,
    Paper,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

interface SelectedProduct {
    productId: string;
    product: Product;
    campaignPrice?: number;
    discountPercent?: number;
    maxQuantity?: number;
}

interface ProductSelectionModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (products: SelectedProduct[]) => void;
    initialSelected?: SelectedProduct[];
}

const PAGE_SIZE = 10;

export function ProductSelectionModal({
    opened,
    onClose,
    onConfirm,
    initialSelected = [],
}: ProductSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(initialSelected);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{
        campaignPrice?: number;
        discountPercent?: number;
        maxQuantity?: number;
    }>({});

    // Fetch products
    const { data: productsRes } = useQuery({
        queryKey: ['products', 'admin', page, search, categoryId],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', PAGE_SIZE.toString());
            if (search) params.set('search', search);
            if (categoryId) params.set('categoryId', categoryId);
            return productService.getAdminProducts();
        },
    });

    // Fetch categories
    const { data: categoriesRes } = useQuery({
        queryKey: ['categories', 'all'],
        queryFn: () => categoryService.getCategories(true),
    });

    const products = useMemo(() => productsRes?.data || [], [productsRes]);
    const categories = useMemo(() => categoriesRes?.data || [], [categoriesRes]);

    const totalPages = useMemo(() => {
        const total = productsRes?.data?.length || 0;
        return Math.ceil(total / PAGE_SIZE);
    }, [productsRes]);

    const categoryOptions = useMemo(() => {
        return categories.map((c: Category) => ({
            value: c.id,
            label: c.name,
        }));
    }, [categories]);

    const isAllChecked = useMemo(() => {
        if (products.length === 0) return false;
        return products.every((p) => selectedProducts.some((sp) => sp.productId === p.id));
    }, [products, selectedProducts]);

    const handleToggleAll = useCallback(() => {
        if (isAllChecked) {
            // Uncheck all products in current page
            const pageProductIds = products.map((p) => p.id);
            setSelectedProducts((prev) => prev.filter((sp) => !pageProductIds.includes(sp.productId)));
        } else {
            // Check all products in current page
            const newSelected = products
                .filter((p) => !selectedProducts.some((sp) => sp.productId === p.id))
                .map((p) => ({
                    productId: p.id,
                    product: p,
                }));
            setSelectedProducts((prev) => [...prev, ...newSelected]);
        }
    }, [isAllChecked, products, selectedProducts]);

    const handleToggleProduct = useCallback((product: Product) => {
        setSelectedProducts((prev) => {
            const exists = prev.find((sp) => sp.productId === product.id);
            if (exists) {
                return prev.filter((sp) => sp.productId !== product.id);
            }
            return [...prev, { productId: product.id, product }];
        });
    }, []);

    const handleEditStart = useCallback((item: SelectedProduct) => {
        setEditingId(item.productId);
        setEditValues({
            campaignPrice: item.campaignPrice,
            discountPercent: item.discountPercent,
            maxQuantity: item.maxQuantity,
        });
    }, []);

    const handleEditSave = useCallback((productId: string) => {
        setSelectedProducts((prev) =>
            prev.map((sp) =>
                sp.productId === productId
                    ? { ...sp, ...editValues }
                    : sp
            )
        );
        setEditingId(null);
        setEditValues({});
    }, [editValues]);

    const handleEditCancel = useCallback(() => {
        setEditingId(null);
        setEditValues({});
    }, []);

    const handleRemove = useCallback((productId: string) => {
        setSelectedProducts((prev) => prev.filter((sp) => sp.productId !== productId));
    }, []);

    const handleConfirm = useCallback(() => {
        onConfirm(selectedProducts);
        onClose();
    }, [selectedProducts, onConfirm, onClose]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Chọn sản phẩm giảm giá"
            size="xl"
            centered
        >
            <Stack gap="md">
                {/* Filters */}
                <Group>
                    <TextInput
                        placeholder="Tìm sản phẩm..."
                        leftSection={<Icon icon="tabler:search" width={16} />}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.currentTarget.value);
                            setPage(1);
                        }}
                        style={{ flex: 1 }}
                    />
                    <Select
                        placeholder="Danh mục"
                        data={categoryOptions}
                        value={categoryId}
                        onChange={(v) => {
                            setCategoryId(v);
                            setPage(1);
                        }}
                        clearable
                        style={{ width: 200 }}
                    />
                </Group>

                {/* Selected count */}
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                        Đã chọn: <Text span fw={700}>{selectedProducts.length}</Text> sản phẩm
                    </Text>
                </Group>

                {/* Product Table */}
                <Box style={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th w={40}>
                                    <Checkbox
                                        checked={isAllChecked}
                                        indeterminate={!isAllChecked && selectedProducts.length > 0}
                                        onChange={handleToggleAll}
                                    />
                                </Table.Th>
                                <Table.Th>Sản phẩm</Table.Th>
                                <Table.Th>Giá gốc</Table.Th>
                                <Table.Th>Danh mục</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {products.map((product) => {
                                const isSelected = selectedProducts.some(
                                    (sp) => sp.productId === product.id
                                );

                                return (
                                    <Table.Tr key={product.id}>
                                        <Table.Td>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleToggleProduct(product)}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" fw={500} lineClamp={1}>
                                                {product.name}
                                            </Text>
                                            {product.sku && (
                                                <Text size="xs" c="dimmed">
                                                    SKU: {product.sku}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {Number(product.price).toLocaleString('vi-VN')}đ
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            {product.category && (
                                                <Badge size="sm" variant="light">
                                                    {product.category.name}
                                                </Badge>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Box>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Group justify="center">
                        <Pagination
                            value={page}
                            onChange={setPage}
                            total={totalPages}
                            size="sm"
                        />
                    </Group>
                )}

                {/* Selected Products with pricing */}
                {selectedProducts.length > 0 && (
                    <Paper withBorder p="md" radius="md">
                        <Text fw={600} mb="sm">
                            Sản phẩm đã chọn - Cấu hình giảm giá
                        </Text>
                        <Stack gap="xs">
                            {selectedProducts.map((item) => {
                                const isEditing = editingId === item.productId;

                                return (
                                    <Paper
                                        key={item.productId}
                                        p="xs"
                                        bg="gray.0"
                                        radius="sm"
                                    >
                                        <Group justify="space-between">
                                            <Group gap="xs">
                                                <Checkbox
                                                    checked
                                                    onChange={() => handleToggleProduct(item.product)}
                                                />
                                                <Text size="sm" lineClamp={1} style={{ maxWidth: 200 }}>
                                                    {item.product.name}
                                                </Text>
                                            </Group>

                                            {isEditing ? (
                                                <Group gap="xs">
                                                    <NumberInput
                                                        placeholder="Giá KM"
                                                        value={editValues.campaignPrice}
                                                        onChange={(v) =>
                                                            setEditValues((prev) => ({
                                                                ...prev,
                                                                campaignPrice: v as number,
                                                            }))
                                                        }
                                                        min={0}
                                                        prefix="₫"
                                                        style={{ width: 120 }}
                                                        size="xs"
                                                    />
                                                    <NumberInput
                                                        placeholder="% KM"
                                                        value={editValues.discountPercent}
                                                        onChange={(v) =>
                                                            setEditValues((prev) => ({
                                                                ...prev,
                                                                discountPercent: v as number,
                                                            }))
                                                        }
                                                        min={0}
                                                        max={100}
                                                        suffix="%"
                                                        style={{ width: 80 }}
                                                        size="xs"
                                                    />
                                                    <NumberInput
                                                        placeholder="Max/USER"
                                                        value={editValues.maxQuantity}
                                                        onChange={(v) =>
                                                            setEditValues((prev) => ({
                                                                ...prev,
                                                                maxQuantity: v as number,
                                                            }))
                                                        }
                                                        min={1}
                                                        style={{ width: 80 }}
                                                        size="xs"
                                                    />
                                                    <Tooltip label="Lưu">
                                                        <ActionIcon
                                                            color="green"
                                                            variant="light"
                                                            onClick={() => handleEditSave(item.productId)}
                                                        >
                                                            <Icon icon="tabler:check" width={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Hủy">
                                                        <ActionIcon
                                                            color="gray"
                                                            variant="light"
                                                            onClick={handleEditCancel}
                                                        >
                                                            <Icon icon="tabler:x" width={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            ) : (
                                                <Group gap="xs">
                                                    {item.campaignPrice && (
                                                        <Badge color="red" variant="light" size="sm">
                                                            {Number(item.campaignPrice).toLocaleString('vi-VN')}đ
                                                        </Badge>
                                                    )}
                                                    {item.discountPercent && (
                                                        <Badge color="red" variant="light" size="sm">
                                                            -{item.discountPercent}%
                                                        </Badge>
                                                    )}
                                                    {item.maxQuantity && (
                                                        <Badge color="blue" variant="light" size="sm">
                                                            max {item.maxQuantity}/user
                                                        </Badge>
                                                    )}
                                                    <Tooltip label="Chỉnh sửa">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            onClick={() => handleEditStart(item)}
                                                        >
                                                            <Icon icon="tabler:plus" width={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa">
                                                        <ActionIcon
                                                            color="red"
                                                            variant="subtle"
                                                            onClick={() => handleRemove(item.productId)}
                                                        >
                                                            <Icon icon="tabler:x" width={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            )}
                                        </Group>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </Paper>
                )}

                {/* Actions */}
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedProducts.length === 0}
                    >
                        Xác nhận ({selectedProducts.length})
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
