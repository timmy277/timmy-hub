'use client';

import { useEffect, type JSX } from 'react';
import {
    Button,
    Checkbox,
    Group,
    Modal,
    SegmentedControl,
    Box,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AddressSelect } from '@/components/AddressSelect/AddressSelect';
import type { User } from '@/types/auth';
import type { Address, CreateAddressDto } from '@/types/address';

const addressFormSchema = z.object({
    fullName: z.string().min(1).max(200),
    phone: z.string().min(8).max(20),
    provinceCode: z.string().min(1).max(50),
    districtCode: z.string().min(1).max(50),
    wardCode: z.string().min(1).max(50),
    provinceName: z.string().optional(),
    districtName: z.string().optional(),
    wardName: z.string().optional(),
    addressLine1: z.string().min(1).max(500),
    addressType: z.enum(['home', 'office']),
    isDefault: z.boolean().optional(),
});

export type AddressFormModalValues = z.infer<typeof addressFormSchema>;

const emptyValues: AddressFormModalValues = {
    fullName: '',
    phone: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    provinceName: '',
    districtName: '',
    wardName: '',
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

    useEffect(() => {
        if (!opened) {
            form.setValues(emptyValues);
            return;
        }
        if (editing) {
            form.setValues({
                fullName: editing.fullName,
                phone: editing.phone,
                provinceCode: editing.provinceCode ?? '',
                districtCode: editing.districtCode ?? '',
                wardCode: editing.wardCode ?? '',
                provinceName: editing.provinceName ?? '',
                districtName: editing.districtName ?? '',
                wardName: editing.wardName ?? '',
                addressLine1: editing.addressLine1,
                addressType: inferAddressTypeFromLabel(editing.label),
                isDefault: editing.isDefault,
            });
        } else {
            form.setValues({
                ...emptyValues,
                fullName: user
                    ? [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || ''
                    : '',
                phone: user?.phone ?? '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, editing?.id]);

    const handleSubmit = form.onSubmit(async values => {
        const homeL = t('addresses.typeHomeLabel');
        const officeL = t('addresses.typeOfficeLabel');
        const dto: CreateAddressDto = {
            label: labelFromAddressType(values.addressType, homeL, officeL),
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            addressLine1: values.addressLine1.trim(),
            provinceCode: values.provinceCode,
            districtCode: values.districtCode,
            wardCode: values.wardCode,
            provinceName: values.provinceName,
            districtName: values.districtName,
            wardName: values.wardName,
            isDefault: values.isDefault,
        };
        try {
            await onSave(dto);
        } catch {
            /* mutation đã báo lỗi */
        }
    });

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
                    <Group grow>
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
                    </Group>

                    <AddressSelect
                        provinceCode={form.values.provinceCode}
                        districtCode={form.values.districtCode}
                        wardCode={form.values.wardCode}
                        onProvinceChange={(code, name) => {
                            form.setFieldValue('provinceCode', code ?? '');
                            form.setFieldValue('provinceName', name ?? '');
                        }}
                        onDistrictChange={(code, name) => {
                            form.setFieldValue('districtCode', code ?? '');
                            form.setFieldValue('districtName', name ?? '');
                        }}
                        onWardChange={(code, name) => {
                            form.setFieldValue('wardCode', code ?? '');
                            form.setFieldValue('wardName', name ?? '');
                        }}
                    />

                    <TextInput
                        required
                        label={t('addresses.specificAddress')}
                        placeholder={t('addresses.specificAddressPlaceholder')}
                        {...form.getInputProps('addressLine1')}
                    />

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
