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
    const queryClient = useQueryClient();
    const isEdit = !!product;

    const mutation = useMutation({
        mutationFn: (data: Partial<CreateProductInput>) =>
            isEdit ? productService.updateProduct(product.id, data) : productService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SELLER_PRODUCTS });
            notifications.show({
                title: 'Thành công',
                message: isEdit ? 'Cập nhật sản phẩm thành công. Vui lòng chờ admin duyệt lại.' : 'Sản phẩm đang chờ admin phê duyệt.',
                color: 'green',
            });
            onSuccess();
        },
        onError: (err: unknown) => {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Có lỗi xảy ra';
            notifications.show({ title: 'Lỗi', message: String(msg ?? 'Có lỗi xảy ra'), color: 'red' });
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
            name: v => (!v.trim() ? 'Nhập tên sản phẩm' : null),
            slug: v => (!v.trim() ? 'Nhập slug' : null),
            price: v => (v < 0 ? 'Giá không hợp lệ' : null),
            stock: v => (v < 0 ? 'Tồn kho không hợp lệ' : null),
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
                            Sản phẩm cập nhật sẽ quay lại trạng thái{' '}
                            <Text span fw={600}>Chờ duyệt</Text>. Admin sẽ phê duyệt lại sau khi thay đổi.
                        </>
                    ) : (
                        <>
                            Sản phẩm sau khi đăng sẽ ở trạng thái{' '}
                            <Text span fw={600}>Chờ duyệt</Text>. Admin sẽ phê duyệt trước khi hiển thị trên sàn.
                        </>
                    )}
                </Alert>

                <TextInput
                    label="Tên sản phẩm"
                    placeholder="VD: Áo thun cotton basic"
                    required
                    {...form.getInputProps('name')}
                />
                <TextInput
                    label="Slug (URL)"
                    placeholder="ao-thun-cotton-basic"
                    description="Tự động tạo từ tên. Chỉ chữ thường, số và dấu gạch ngang."
                    required
                    {...form.getInputProps('slug')}
                />
                <Textarea
                    label="Mô tả sản phẩm"
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    rows={4}
                    {...form.getInputProps('description')}
                />
                <Group grow>
                    <NumberInput
                        label="Giá bán (₫)"
                        placeholder="0"
                        min={0}
                        thousandSeparator=","
                        required
                        {...form.getInputProps('price')}
                    />
                    <NumberInput
                        label="Giá gốc (₫)"
                        placeholder="0"
                        min={0}
                        thousandSeparator=","
                        {...form.getInputProps('originalPrice')}
                    />
                </Group>
                <Group grow>
                    <NumberInput
                        label="Tồn kho"
                        placeholder="0"
                        min={0}
                        required
                        {...form.getInputProps('stock')}
                    />
                    <TextInput
                        label="Mã SKU"
                        placeholder="VD: AT-001-TRANG-L"
                        {...form.getInputProps('sku')}
                    />
                </Group>

                <Group justify="flex-end" mt="sm">
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                        disabled={mutation.isPending}
                    >
                        Huỷ
                    </Button>
                    <Button
                        type="submit"
                        loading={mutation.isPending}
                    >
                        {isEdit ? 'Lưu thay đổi' : 'Gửi duyệt'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
