'use client';

import { useEffect, useMemo, type JSX } from 'react';
import {
    Button,
    Checkbox,
    Group,
    Modal,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    SegmentedControl,
    Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
    VIETNAM_ADMIN_UNITS,
    findProvinceByCityName,
    findDistrict,
} from '@/constants/vn-admin-units';
import type { User } from '@/types/auth';
import type { Address, CreateAddressDto } from '@/types/address';

const addressFormSchema = z.object({
    fullName: z.string().min(1).max(200),
    phone: z.string().min(8).max(20),
    /** Tỉnh/Thành phố — tên hiển thị khớp VIETNAM_ADMIN_UNITS */
    city: z.string().min(1).max(200),
    district: z.string().min(1).max(200),
    ward: z.string().min(1).max(200),
    addressLine1: z.string().min(1).max(500),
    addressType: z.enum(['home', 'office']),
    isDefault: z.boolean().optional(),
});

export type AddressFormModalValues = z.infer<typeof addressFormSchema>;

const emptyValues: AddressFormModalValues = {
    fullName: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    addressLine1: '',
    addressType: 'home',
    isDefault: false,
};

function inferAddressTypeFromLabel(label: string | null | undefined): 'home' | 'office' {
    if (!label) return 'home';
    const l = label.toLowerCase();
    if (l.includes('văn phòng') || l.includes('office')) return 'office';
    return 'home';
}

function labelFromAddressType(t: 'home' | 'office', homeLabel: string, officeLabel: string): string {
    return t === 'home' ? homeLabel : officeLabel;
}

export interface AddressFormModalProps {
    opened: boolean;
    onClose: () => void;
    editing: Address | null;
    onSave: (dto: CreateAddressDto) => Promise<void>;
    isSaving: boolean;
    /** User hiện tại — prefill fullName & phone khi thêm mới */
    user?: User | null;
}

export function AddressFormModal({
    opened,
    onClose,
    editing,
    onSave,
    isSaving,
    user,
}: AddressFormModalProps): JSX.Element {
    const { t } = useTranslation('common');

    const form = useForm<AddressFormModalValues>({
        initialValues: emptyValues,
        validate: zodResolver(addressFormSchema),
    });

    const provinceOptions = useMemo(
        () => VIETNAM_ADMIN_UNITS.map(p => ({ value: p.name, label: p.name })),
        [],
    );

    const districtOptions = useMemo(() => {
        const p = findProvinceByCityName(form.values.city);
        return p?.districts.map(d => ({ value: d.name, label: d.name })) ?? [];
    }, [form.values.city]);

    const wardOptions = useMemo(() => {
        const d = findDistrict(form.values.city, form.values.district);
        return d?.wards.map(w => ({ value: w.name, label: w.name })) ?? [];
    }, [form.values.city, form.values.district]);

    useEffect(() => {
        if (!opened) {
            form.setValues(emptyValues);
            return;
        }
        if (editing) {
            form.setValues({
                fullName: editing.fullName,
                phone: editing.phone,
                city: editing.city,
                district: editing.district,
                ward: editing.ward,
                addressLine1: editing.addressLine1,
                addressType: inferAddressTypeFromLabel(editing.label),
                isDefault: editing.isDefault,
            });
        } else {
            // Thêm mới → prefill từ user profile
            form.setValues({
                ...emptyValues,
                fullName: user
                    ? [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || ''
                    : '',
                phone: user?.phone ?? '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- đồng bộ khi mở/đóng modal hoặc đổi địa chỉ đang sửa
    }, [opened, editing?.id]);

    const handleProvinceChange = (value: string | null): void => {
        const v = value ?? '';
        form.setFieldValue('city', v);
        form.setFieldValue('district', '');
        form.setFieldValue('ward', '');
    };

    const handleDistrictChange = (value: string | null): void => {
        const v = value ?? '';
        form.setFieldValue('district', v);
        form.setFieldValue('ward', '');
    };

    const handleSubmit = form.onSubmit(async values => {
        const homeL = t('addresses.typeHomeLabel');
        const officeL = t('addresses.typeOfficeLabel');
        const dto: CreateAddressDto = {
            label: labelFromAddressType(values.addressType, homeL, officeL),
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            addressLine1: values.addressLine1.trim(),
            ward: values.ward.trim(),
            district: values.district.trim(),
            city: values.city.trim(),
            isDefault: values.isDefault,
        };
        try {
            await onSave(dto);
        } catch {
            /* mutation đã báo lỗi */
        }
    });

    const districtDisabled = !form.values.city;
    const wardDisabled = !form.values.city || !form.values.district;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            radius="md"
            padding="lg"
            title={
                <Stack gap={4}>
                    <Text fw={700} size="lg">
                        {editing ? t('addresses.modalEditTitle') : t('addresses.modalAddTitle')}
                    </Text>
                    <Text size="sm" c="dimmed" fw={400}>
                        {t('addresses.modalSubtitle')}
                    </Text>
                </Stack>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <TextInput
                            required
                            label={t('addresses.fullName')}
                            placeholder={t('addresses.fullName')}
                            {...form.getInputProps('fullName')}
                        />
                        <TextInput
                            required
                            label={t('addresses.phone')}
                            placeholder="(+84) ..."
                            {...form.getInputProps('phone')}
                        />
                    </SimpleGrid>

                    <Select
                        required
                        searchable
                        clearable
                        label={t('addresses.province')}
                        placeholder={t('addresses.selectProvince')}
                        data={provinceOptions}
                        value={form.values.city || null}
                        onChange={handleProvinceChange}
                        nothingFoundMessage={t('addresses.nothingFound')}
                    />

                    <Select
                        required
                        searchable
                        clearable
                        label={t('addresses.district')}
                        placeholder={t('addresses.selectDistrict')}
                        data={districtOptions}
                        value={form.values.district || null}
                        onChange={handleDistrictChange}
                        disabled={districtDisabled}
                        nothingFoundMessage={t('addresses.nothingFound')}
                    />

                    <Select
                        required
                        searchable
                        clearable
                        label={t('addresses.ward')}
                        placeholder={t('addresses.selectWard')}
                        data={wardOptions}
                        value={form.values.ward || null}
                        onChange={v => form.setFieldValue('ward', v ?? '')}
                        disabled={wardDisabled}
                        nothingFoundMessage={t('addresses.nothingFound')}
                    />

                    <TextInput
                        required
                        label={t('addresses.specificAddress')}
                        placeholder={t('addresses.specificAddressPlaceholder')}
                        {...form.getInputProps('addressLine1')}
                    />

                    {/* Placeholder bản đồ — tích hợp Google Maps sau */}
                    <Box
                        className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50"
                        aria-hidden
                    >
                        <Text size="sm" c="dimmed" ta="center" px="md">
                            {t('addresses.mapPlaceholder')}
                        </Text>
                    </Box>

                    <div>
                        <Text size="sm" fw={500} mb="xs">
                            {t('addresses.addressType')}
                        </Text>
                        <SegmentedControl
                            fullWidth
                            value={form.values.addressType}
                            onChange={v => form.setFieldValue('addressType', v as 'home' | 'office')}
                            data={[
                                { label: t('addresses.typeHome'), value: 'home' },
                                { label: t('addresses.typeOffice'), value: 'office' },
                            ]}
                            color="orange"
                        />
                    </div>

                    <Checkbox
                        label={t('addresses.setDefaultFull')}
                        {...form.getInputProps('isDefault', { type: 'checkbox' })}
                    />

                    <Group justify="space-between" mt="lg">
                        <Button variant="subtle" type="button" onClick={onClose} c="dimmed">
                            {t('addresses.back')}
                        </Button>
                        <Button type="submit" color="orange" loading={isSaving} size="md">
                            {t('addresses.complete')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
