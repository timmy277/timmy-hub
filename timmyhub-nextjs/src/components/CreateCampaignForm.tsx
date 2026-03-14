'use client';

import { useState } from 'react';
import { Button, TextInput, Checkbox, Group, Stack, Paper, Select, Badge, ActionIcon, Tooltip, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService, Campaign } from '@/services/campaign.service';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';
import { ProductSelectionModal } from '@/components/ProductSelectionModal';
import { Product } from '@/types/product';
import Iconify from '@/components/iconify/Iconify';

interface SelectedProduct {
    productId: string;
    product: Product;
    campaignPrice?: number;
    discountPercent?: number;
    maxQuantity?: number;
}

export function CreateCampaignForm({
    onSuccessCallback,
    initialData,
}: {
    onSuccessCallback?: () => void;
    initialData?: Campaign;
}) {
    const queryClient = useQueryClient();
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [type, setType] = useState(initialData?.type || 'VOUCHER_CAMPAIGN');
    const [startDate, setStartDate] = useState(initialData?.startDate ? dayjs(initialData.startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(initialData?.endDate ? dayjs(initialData.endDate).format('YYYY-MM-DD') : dayjs().add(30, 'day').format('YYYY-MM-DD'));
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [modalOpened, setModalOpened] = useState(false);

    const isUpdate = !!initialData;

    // Load existing campaign products if updating
    const existingProducts = initialData?.campaignProducts || [];
    const [loadedExistingProducts, setLoadedExistingProducts] = useState<SelectedProduct[]>(
        existingProducts.map((cp) => ({
            productId: cp.productId,
            product: cp.product as unknown as Product,
            campaignPrice: cp.campaignPrice,
            discountPercent: cp.discountPercent,
            maxQuantity: cp.maxQuantity,
        }))
    );

    // Combine existing + newly selected products
    const allSelectedProducts = [...loadedExistingProducts, ...selectedProducts.filter(
        (sp) => !loadedExistingProducts.some((ep) => ep.productId === sp.productId)
    )];

    const mutation = useMutation({
        mutationFn: async (data: Partial<Campaign>) => {
            if (isUpdate) {
                await campaignService.update(initialData.id, data);
                // Add new products if any
                if (selectedProducts.length > 0) {
                    await campaignService.addProductsWithPrices(
                        initialData.id,
                        selectedProducts.map((sp) => ({
                            productId: sp.productId,
                            campaignPrice: sp.campaignPrice,
                            discountPercent: sp.discountPercent,
                            maxQuantity: sp.maxQuantity,
                        }))
                    );
                }
            } else {
                const res = await campaignService.create(data);
                // Add products after campaign is created
                if (selectedProducts.length > 0 && res.data?.id) {
                    await campaignService.addProductsWithPrices(
                        res.data.id,
                        selectedProducts.map((sp) => ({
                            productId: sp.productId,
                            campaignPrice: sp.campaignPrice,
                            discountPercent: sp.discountPercent,
                            maxQuantity: sp.maxQuantity,
                        }))
                    );
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
            notifications.show({
                title: 'Thành công',
                message: isUpdate ? 'Cập nhật chương trình khuyến mãi thành công' : 'Tạo chương trình khuyến mãi thành công',
                color: 'green',
            });
            setName('');
            setDescription('');
            setSelectedProducts([]);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (err: AxiosError<{ message?: string; error?: string[] }>) => {
            notifications.show({
                title: 'Lỗi',
                message:
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.[0] ||
                    (isUpdate ? 'Không thể cập nhật campaign' : 'Không thể tạo campaign'),
                color: 'red',
            });
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            name,
            description,
            type,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            isActive,
        });
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts((prev) => prev.filter((sp) => sp.productId !== productId));
    };

    return (
        <Paper withBorder radius="md" p="lg" mt="md">
            <Stack gap="md" maw={600}>
                <TextInput
                    label="Tên Campaign"
                    required
                    value={name}
                    onChange={e => setName(e.currentTarget.value)}
                />
                <TextInput
                    label="Mô tả"
                    value={description}
                    onChange={e => setDescription(e.currentTarget.value)}
                />
                <Select
                    label="Loại Campaign"
                    data={[
                        { value: 'VOUCHER_CAMPAIGN', label: 'Voucher Campaign' },
                        { value: 'FLASH_SALE', label: 'Flash Sale' },
                        { value: 'CATEGORY_SALE', label: 'Category Sale' },
                        { value: 'EVENT', label: 'Event' },
                    ]}
                    value={type}
                    onChange={v => setType(v as string)}
                />
                <Group grow>
                    <TextInput
                        type="date"
                        label="Ngày bắt đầu"
                        required
                        value={startDate}
                        onChange={e => setStartDate(e.currentTarget.value)}
                    />
                    <TextInput
                        type="date"
                        label="Ngày kết thúc"
                        required
                        value={endDate}
                        onChange={e => setEndDate(e.currentTarget.value)}
                    />
                </Group>
                <Checkbox
                    label="Kích hoạt ngay"
                    checked={isActive}
                    onChange={e => setIsActive(e.currentTarget.checked)}
                    mt="sm"
                />

                {/* Product Selection */}
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Text fw={500}>Sản phẩm giảm giá</Text>
                        <Button
                            variant="light"
                            size="xs"
                            leftSection={<Iconify icon="tabler:plus" width={14} />}
                            onClick={() => setModalOpened(true)}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Group>

                    {allSelectedProducts.length > 0 && (
                        <Stack gap="xs">
                            {allSelectedProducts.map((item) => (
                                <Paper
                                    key={item.productId}
                                    p="xs"
                                    withBorder
                                    radius="sm"
                                >
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <Text size="sm" lineClamp={1} maw={250}>
                                                {item.product?.name || item.productId}
                                            </Text>
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
                                        </Group>
                                        {!loadedExistingProducts.some((ep) => ep.productId === item.productId) && (
                                            <Tooltip label="Xóa">
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={() => handleRemoveProduct(item.productId)}
                                                >
                                                    <Iconify icon="tabler:trash" width={14} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {allSelectedProducts.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                            Chưa chọn sản phẩm nào
                        </Text>
                    )}
                </Stack>

                <Group justify="right" mt="md">
                    <Button onClick={handleSubmit} loading={mutation.isPending}>
                        {isUpdate ? 'Cập nhật' : 'Hoàn tất tạo'}
                    </Button>
                </Group>
            </Stack>

            <ProductSelectionModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                onConfirm={(products) => setSelectedProducts(products)}
            />
        </Paper>
    );
}
