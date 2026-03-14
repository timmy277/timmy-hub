'use client';

/**
 * Form tạo sản phẩm mới cho Seller
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
import Iconify from '@/components/iconify/Iconify';
import { useCreateSellerProduct } from '@/hooks/useSellerProducts';

interface FormValues {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
}

interface Props {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateSellerProduct({ onSuccess, onCancel }: Props) {
    const createMutation = useCreateSellerProduct();

    const form = useForm<FormValues>({
        initialValues: { name: '', slug: '', description: '', price: 0, stock: 0, sku: '' },
        validate: {
            name: v => (!v.trim() ? 'Nhập tên sản phẩm' : null),
            slug: v => (!v.trim() ? 'Nhập slug' : v.trim() !== v.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') ? 'Slug chỉ gồm chữ thường, số và dấu -' : null),
            price: v => (v < 0 ? 'Giá không hợp lệ' : null),
            stock: v => (v < 0 ? 'Tồn kho không hợp lệ' : null),
        },
    });

    // Auto-generate slug từ tên
    useEffect(() => {
        if (!form.values.name) return;
        const slug = form.values.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        form.setFieldValue('slug', slug);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.name]);

    const handleSubmit = form.onSubmit(values => {
        createMutation.mutate(
            {
                name: values.name.trim(),
                slug: values.slug.trim(),
                description: values.description.trim() || undefined,
                price: Number(values.price),
                stock: Number(values.stock),
                sku: values.sku.trim() || undefined,
            },
            { onSuccess },
        );
    });

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md" p="md">
                <Alert icon={<Iconify icon="tabler:info-circle" width={18} />} color="blue" variant="light">
                    Sản phẩm sau khi đăng sẽ ở trạng thái{' '}
                    <Text span fw={600}>Chờ duyệt</Text>. Admin sẽ phê duyệt trước khi hiển thị trên sàn.
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
                        label="Tồn kho"
                        placeholder="0"
                        min={0}
                        required
                        {...form.getInputProps('stock')}
                    />
                </Group>
                <TextInput
                    label="Mã SKU (tuỳ chọn)"
                    placeholder="VD: AT-001-TRANG-L"
                    {...form.getInputProps('sku')}
                />

                <Group justify="flex-end" mt="sm">
                    <Button
                        variant="subtle"
                        onClick={onCancel}
                        disabled={createMutation.isPending}
                    >
                        Huỷ
                    </Button>
                    <Button type="submit" loading={createMutation.isPending}>
                        Gửi duyệt
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
