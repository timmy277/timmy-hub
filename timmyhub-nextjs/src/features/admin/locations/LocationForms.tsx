'use client';

import { TextInput, Select, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

export const provinceFormSchema = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200),
});

export type ProvinceFormValues = z.infer<typeof provinceFormSchema>;

export function ProvinceForm({
    initialValues,
    onSubmit,
    isLoading,
    onCancel,
}: {
    initialValues?: ProvinceFormValues;
    onSubmit: (values: ProvinceFormValues) => void;
    isLoading: boolean;
    onCancel?: () => void;
}) {
    const form = useForm<ProvinceFormValues>({
        initialValues: initialValues ?? { code: '', name: '', slug: '' },
        validate: zodResolver(provinceFormSchema),
    });

    const handleSubmit = form.onSubmit((values) => onSubmit(values));

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <TextInput label="Mã tỉnh/thành" placeholder="VD: 01" {...form.getInputProps('code')} required />
                <TextInput label="Tên tỉnh/thành" placeholder="VD: Thành phố Hà Nội" {...form.getInputProps('name')} required />
                <TextInput label="Slug" placeholder="VD: thanh-pho-ha-noi" {...form.getInputProps('slug')} required />
                <Group justify="flex-end">
                    {onCancel && (
                        <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
                            Hủy
                        </Button>
                    )}
                    <Button type="submit" loading={isLoading}>
                        {initialValues ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

// ===== District Form =====

export const districtFormSchema = z.object({
    code: z.string().min(1).max(50),
    provinceCode: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200),
});

export type DistrictFormValues = z.infer<typeof districtFormSchema>;

export function DistrictForm({
    initialValues,
    provinces,
    onSubmit,
    isLoading,
    onCancel,
}: {
    initialValues?: DistrictFormValues;
    provinces: { code: string; name: string }[];
    onSubmit: (values: DistrictFormValues) => void;
    isLoading: boolean;
    onCancel?: () => void;
}) {
    const form = useForm<DistrictFormValues>({
        initialValues: initialValues ?? { code: '', provinceCode: '', name: '', slug: '' },
        validate: zodResolver(districtFormSchema),
    });

    const handleSubmit = form.onSubmit((values) => onSubmit(values));

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <Select
                    label="Tỉnh/Thành phố"
                    placeholder="Chọn tỉnh/thành"
                    data={provinces.map(p => ({ value: p.code, label: p.name }))}
                    searchable
                    required
                    {...form.getInputProps('provinceCode')}
                />
                <TextInput label="Mã quận/huyện" placeholder="VD: 001" {...form.getInputProps('code')} required />
                <TextInput label="Tên quận/huyện" placeholder="VD: Quận Ba Đình" {...form.getInputProps('name')} required />
                <TextInput label="Slug" placeholder="VD: quan-ba-dinh" {...form.getInputProps('slug')} required />
                <Group justify="flex-end">
                    {onCancel && (
                        <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
                            Hủy
                        </Button>
                    )}
                    <Button type="submit" loading={isLoading}>
                        {initialValues ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

// ===== Ward Form =====

export const wardFormSchema = z.object({
    code: z.string().min(1).max(50),
    districtCode: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200),
});

export type WardFormValues = z.infer<typeof wardFormSchema>;

export function WardForm({
    initialValues,
    onSubmit,
    isLoading,
    onCancel,
}: {
    initialValues?: WardFormValues;
    onSubmit: (values: WardFormValues) => void;
    isLoading: boolean;
    onCancel?: () => void;
}) {
    const form = useForm<WardFormValues>({
        initialValues: initialValues ?? { code: '', districtCode: '', name: '', slug: '' },
        validate: zodResolver(wardFormSchema),
    });

    const handleSubmit = form.onSubmit((values) => onSubmit(values));

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md">
                <TextInput label="Mã phường/xã" placeholder="VD: 00001" {...form.getInputProps('code')} required />
                <TextInput label="Tên phường/xã" placeholder="VD: Phường Phúc Xá" {...form.getInputProps('name')} required />
                <TextInput label="Slug" placeholder="VD: phuong-phuc-xa" {...form.getInputProps('slug')} required />
                <Group justify="flex-end">
                    {onCancel && (
                        <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
                            Hủy
                        </Button>
                    )}
                    <Button type="submit" loading={isLoading}>
                        {initialValues ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
