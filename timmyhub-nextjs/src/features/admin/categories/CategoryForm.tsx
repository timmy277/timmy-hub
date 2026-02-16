'use client';

import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import {
    TextInput,
    Textarea,
    Button,
    Stack,
    Group,
    Switch,
    Select,
} from '@mantine/core';
import { Category } from '@/types/category';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useCategories } from '@/hooks/useCategories';

const categorySchema = z.object({
    name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
    slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự'),
    description: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    initialValues?: Partial<Category>;
    onSubmit: (values: CategoryFormValues) => void;
    isLoading?: boolean;
}

export function CategoryForm({ initialValues, onSubmit, isLoading }: CategoryFormProps) {
    const { t } = useTranslation();
    const { data: categoriesResponse } = useCategories(true);
    
    // Lọc danh sách danh mục làm cha (tránh chọn chính nó làm cha)
    const parentOptions = (categoriesResponse?.data || [])
        .filter(c => c.id !== initialValues?.id)
        .map(c => ({
            value: c.id,
            label: c.name,
        }));

    const form = useForm<CategoryFormValues>({
        initialValues: {
            name: initialValues?.name || '',
            slug: initialValues?.slug || '',
            description: initialValues?.description || '',
            parentId: initialValues?.parentId || null,
            image: initialValues?.image || null,
            isActive: initialValues?.isActive ?? true,
        },
        validate: zodResolver(categorySchema),
    });

    // Auto slug
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
                    placeholder="Tên danh mục"
                    required
                    {...form.getInputProps('name')}
                />
                
                <TextInput
                    label="Slug"
                    placeholder="ten-danh-muc"
                    required
                    {...form.getInputProps('slug')}
                />

                <Select
                    label="Danh mục cha"
                    placeholder="Chọn danh mục cha (tùy chọn)"
                    data={parentOptions}
                    clearable
                    searchable
                    {...form.getInputProps('parentId')}
                />

                <Textarea
                    label={t('table.columns.description')}
                    placeholder="Mô tả danh mục"
                    minRows={3}
                    {...form.getInputProps('description')}
                />

                <ImageUpload
                    label={t('table.columns.image')}
                    value={form.values.image || ''}
                    onChange={(url) => form.setFieldValue('image', url as string)}
                />

                <Switch
                    label={t('table.columns.status')}
                    {...form.getInputProps('isActive', { type: 'checkbox' })}
                />

                <Group justify="flex-end" mt="xl">
                    <Button type="submit" loading={isLoading}>
                        {initialValues?.id ? t('common.update') : t('common.create')}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
