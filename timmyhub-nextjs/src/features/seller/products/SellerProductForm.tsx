'use client';

/**
 * Form tạo/cập nhật sản phẩm cho Seller
 * Dùng chung cho cả Create và Edit
 */
import { useEffect } from 'react';
import {
    Stack,
    TextInput,
    Textarea,
    NumberInput,
    Button,
    Group,
    Alert,
    Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Iconify from '@/components/iconify/Iconify';
import { productService } from '@/services/product.service';
import { notifications } from '@mantine/notifications';
import { Product, CreateProductInput } from '@/types/product';
import { QUERY_KEYS } from '@/constants';
import { useTranslation } from 'react-i18next';

interface FormValues {
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice: number;
    stock: number;
    sku: string;
}

interface Props {
    product?: Product; // Nếu có = edit mode, không có = create mode
    onSuccess: () => void;
    onCancel: () => void;
}

export function SellerProductForm({ product, onSuccess, onCancel }: Props) {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const isEdit = !!product;

    const mutation = useMutation({
        mutationFn: (data: Partial<CreateProductInput>) =>
            isEdit ? productService.updateProduct(product.id, data) : productService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SELLER_PRODUCTS });
            notifications.show({
                title: t('common.success'),
                message: isEdit ? t('seller.productUpdateSuccess') : t('seller.productCreateSuccess'),
                color: 'green',
            });
            onSuccess();
        },
        onError: (err: unknown) => {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : t('common.error');
            notifications.show({ title: t('common.error'), message: String(msg ?? t('common.error')), color: 'red' });
        },
    });

    const form = useForm<FormValues>({
        initialValues: {
            name: product?.name || '',
            slug: product?.slug || '',
            description: product?.description || '',
            price: product?.price || 0,
            originalPrice: product?.originalPrice || product?.price || 0,
            stock: product?.stock || 0,
            sku: product?.sku || '',
        },
        validate: {
            name: v => (!v.trim() ? t('validation.required', { field: t('seller.productNameLabel') }) : null),
            slug: v => (!v.trim() ? t('validation.required', { field: t('seller.slugLabel') }) : null),
            price: v => (v < 0 ? t('seller.invalidPrice') : null),
            stock: v => (v < 0 ? t('seller.invalidStock') : null),
        },
    });

    // Auto-generate slug từ tên (chỉ khi tạo mới hoặc name thay đổi)
    useEffect(() => {
        if (!form.values.name) return;
        if (isEdit && form.values.name === product?.name) return;

        const slug = form.values.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        form.setFieldValue('slug', slug);
    }, [form.values.name, isEdit, form, product?.name]);

    const handleSubmit = form.onSubmit(values => {
        const data: Partial<CreateProductInput> = {
            name: values.name.trim(),
            slug: values.slug.trim(),
            description: values.description.trim() || undefined,
            price: Number(values.price),
            originalPrice: Number(values.originalPrice) || undefined,
            stock: Number(values.stock),
            sku: values.sku.trim() || undefined,
        };

        mutation.mutate(data, { onSuccess });
    });

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md" p="md">
                <Alert
                    icon={<Iconify icon="tabler:info-circle" width={18} />}
                    color="blue"
                    variant="light"
                >
                    {isEdit ? (
                        <>
                            {t('seller.productUpdateNote')}{' '}
                            <Text span fw={600}>{t('seller.pendingApprovalStatus')}</Text>. {t('seller.productUpdateMessage')}
                        </>
                    ) : (
                        <>
                            {t('seller.pendingApprovalNote')}{' '}
                            <Text span fw={600}>{t('seller.pendingApprovalStatus')}</Text>{t('seller.pendingApprovalMessage')}
                        </>
                    )}
                </Alert>

                <TextInput
                    label={t('seller.productNameLabel')}
                    placeholder={t('seller.productNameExample')}
                    required
                    {...form.getInputProps('name')}
                />
                <TextInput
                    label={t('seller.slugLabel')}
                    placeholder="ao-thun-cotton-basic"
                    description={t('seller.slugDescription')}
                    required
                    {...form.getInputProps('slug')}
                />
                <Textarea
                    label={t('seller.productDescriptionLabel')}
                    placeholder={t('seller.productDescriptionPlaceholder')}
                    rows={4}
                    {...form.getInputProps('description')}
                />
                <Group grow>
                    <NumberInput
                        label={t('seller.sellingPrice')}
                        placeholder="0"
                        min={0}
                        thousandSeparator=","
                        required
                        {...form.getInputProps('price')}
                    />
                    <NumberInput
                        label={t('seller.originalPriceLabel')}
                        placeholder="0"
                        min={0}
                        thousandSeparator=","
                        {...form.getInputProps('originalPrice')}
                    />
                </Group>
                <Group grow>
                    <NumberInput
                        label={t('seller.stockLabel')}
                        placeholder="0"
                        min={0}
                        required
                        {...form.getInputProps('stock')}
                    />
                    <TextInput
                        label={t('seller.skuCode')}
                        placeholder={t('seller.skuExample')}
                        {...form.getInputProps('sku')}
                    />
                </Group>

                <Group justify="flex-end" mt="sm">
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                        disabled={mutation.isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        loading={mutation.isPending}
                    >
                        {isEdit ? t('common.save') : t('seller.submitForApproval')}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
