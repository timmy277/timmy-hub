'use client';

import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import {
    TextInput,
    NumberInput,
    Textarea,
    Button,
    Stack,
    Group,
    Box,
    Select,
    Text,
} from '@mantine/core';
import { Product } from '@/types/product';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';

const productSchema = z.object({
    name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
    slug: z.string().min(3, 'Slug phải có ít nhất 3 ký tự'),
    description: z.string().optional(),
    price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
    stock: z.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
    sku: z.string().optional(),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
    images: z.array(z.string()).min(1, 'Vui lòng tải lên ít nhất 1 hình ảnh'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialValues?: Partial<Product>;
    onSubmit: (values: ProductFormValues) => void;
    isLoading?: boolean;
}

export function ProductForm({ initialValues, onSubmit, isLoading }: ProductFormProps) {
    const { t } = useTranslation();
    
    // Giả lập danh mục (Trong thực tế nên fetch từ API)
    const [categories] = useState([
        { value: 'cat1', label: 'Điện thoại' },
        { value: 'cat2', label: 'Laptop' },
        { value: 'cat3', label: 'Phụ kiện' },
    ]);

    const form = useForm<ProductFormValues>({
        initialValues: {
            name: initialValues?.name || '',
            slug: initialValues?.slug || '',
            description: initialValues?.description || '',
            price: initialValues?.price || 0,
            stock: initialValues?.stock || 0,
            sku: initialValues?.sku || '',
            categoryId: initialValues?.categoryId || '',
            images: initialValues?.images || [],
        },
        validate: zodResolver(productSchema),
    });

    // Tự động tạo slug từ tên (nếu slug chưa được sửa tay)
    useEffect(() => {
        if (!initialValues?.slug && form.values.name) {
            const slug = form.values.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
            form.setFieldValue('slug', slug);
        }
    }, [form.values.name, initialValues?.slug, form]);

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label={t('table.columns.name')}
                    placeholder="Nhập tên sản phẩm"
                    required
                    {...form.getInputProps('name')}
                />
                
                <TextInput
                    label="Slug"
                    placeholder="ten-san-pham"
                    required
                    {...form.getInputProps('slug')}
                />

                <Group grow>
                    <Select
                        label={t('table.columns.category')}
                        placeholder="Chọn danh mục"
                        data={categories}
                        required
                        {...form.getInputProps('categoryId')}
                    />
                    <TextInput
                        label="SKU"
                        placeholder="Mã sản phẩm"
                        {...form.getInputProps('sku')}
                    />
                </Group>

                <Group grow>
                    <NumberInput
                        label={`${t('table.columns.price')} (₫)`}
                        placeholder="0"
                        min={0}
                        thousandSeparator="."
                        decimalSeparator=","
                        required
                        {...form.getInputProps('price')}
                    />
                    <NumberInput
                        label={t('table.columns.stock')}
                        placeholder="0"
                        min={0}
                        required
                        {...form.getInputProps('stock')}
                    />
                </Group>

                <Textarea
                    label={t('table.columns.description')}
                    placeholder="Nhập mô tả chi tiết"
                    minRows={4}
                    {...form.getInputProps('description')}
                />

                <Box>
                    <ImageUpload
                        label={t('table.columns.images')}
                        description="Tải lên ít nhất 1 ảnh"
                        value={form.values.images}
                        onChange={(urls) => form.setFieldValue('images', urls as string[])}
                        multiple
                    />
                    {form.errors.images && (
                        <Text size="xs" c="red" mt={5}>
                            {String(form.errors.images)}
                        </Text>
                    )}
                </Box>

                <Group justify="flex-end" mt="xl">
                    <Button type="submit" loading={isLoading}>
                        {initialValues?.id ? t('common.update') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
