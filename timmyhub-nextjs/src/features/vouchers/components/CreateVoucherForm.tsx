import { useState } from 'react';
import { Button, TextInput, Select, NumberInput, Group, Stack, Paper, Alert } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { voucherService, Voucher } from '@/services/voucher.service';
import { campaignService } from '@/services/campaign.service';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

export function CreateVoucherForm({
    onSuccessCallback,
    initialData,
}: {
    onSuccessCallback?: () => void;
    initialData?: Voucher;
}) {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [code, setCode] = useState(initialData?.code || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'>(initialData?.type || 'PERCENTAGE');
    const [value, setValue] = useState<number | ''>(initialData?.value ?? '');
    const [minOrderValue, setMinOrderValue] = useState<number | ''>(initialData?.minOrderValue ?? '');
    const [maxDiscount, setMaxDiscount] = useState<number | ''>(initialData?.maxDiscount ?? '');
    const [usageLimit, setUsageLimit] = useState<number | ''>(initialData?.usageLimit ?? '');
    const [perUserLimit, setPerUserLimit] = useState<number | ''>(initialData?.perUserLimit ?? 1);
    const [campaignId, setCampaignId] = useState<string | null>(initialData?.campaignId || null);
    const [startDate, setStartDate] = useState(initialData?.startDate ? dayjs(initialData.startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(initialData?.endDate ? dayjs(initialData.endDate).format('YYYY-MM-DD') : dayjs().add(7, 'day').format('YYYY-MM-DD'));

    // Fetch campaigns
    const { data: campaignsRes } = useQuery({
        queryKey: ['campaigns-for-voucher'],
        queryFn: () => campaignService.getSellerCampaigns(), // We use getSellerCampaigns to get the campaigns the user has access to
    });

    const isUpdate = !!initialData;

    const mutation = useMutation({
        mutationFn: (data: Partial<Voucher>) =>
            isUpdate ? voucherService.update(initialData.id, data) : voucherService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
            setValidationErrors({});
            notifications.show({
                title: t('common.success'),
                message: isUpdate ? t('voucher.createForm.successUpdate') : t('voucher.createForm.successCreate'),
                color: 'green',
            });
            // Reset form
            setCode('');
            setDescription('');
            setType('PERCENTAGE');
            setValue('');
            setMinOrderValue('');
            setMaxDiscount('');
            setUsageLimit('');
            setPerUserLimit(1);
            setCampaignId(null);
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (err: AxiosError<{ message?: string; error?: string[] | string; validationErrors?: Record<string, string[]> }>) => {
            const data = err?.response?.data;
            if (data?.validationErrors) {
                setValidationErrors(data.validationErrors);
            }
            notifications.show({
                title: t('voucher.createForm.errorTitle'),
                message:
                    data?.message ||
                    (Array.isArray(data?.error) ? data.error[0] : data?.error) ||
                    (isUpdate ? t('voucher.createForm.errorUpdate') : t('voucher.createForm.errorCreate')),
                color: 'red',
            });
        },
    });

    const handleSubmit = () => {
        setValidationErrors({});
        mutation.mutate({
            // Tự động uppercase để đảm bảo pass regex /^[A-Z0-9_]+$/
            code: code.trim().toUpperCase(),
            description: description || undefined,
            type,
            value: Number(value),
            minOrderValue: minOrderValue !== '' ? Number(minOrderValue) : undefined,
            maxDiscount: maxDiscount !== '' ? Number(maxDiscount) : undefined,
            usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
            perUserLimit: perUserLimit !== '' ? Number(perUserLimit) : 1,
            campaignId: campaignId || undefined,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
        });
    };

    return (
        <Paper withBorder radius="md" p="lg" mt="md">
            <Stack gap="md" maw={600}>
                {Object.keys(validationErrors).length > 0 && (
                    <Alert icon={<Iconify icon="solar:danger-bold" width={16} />} color="red" title={t('voucher.createForm.invalidData')}>
                        <Stack gap={4}>
                            {Object.entries(validationErrors).map(([field, messages]) =>
                                messages.map((msg, i) => (
                                    <div key={`${field}-${i}`}>
                                        <strong>{field}</strong>: {msg}
                                    </div>
                                ))
                            )}
                        </Stack>
                    </Alert>
                )}
                <TextInput
                    label={t('voucher.createForm.codeLabel')}
                    description={t('voucher.createForm.codeDesc')}
                    required
                    value={code}
                    readOnly={isUpdate}
                    error={validationErrors['code']?.[0]}
                    onChange={e => setCode(e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                />
                <TextInput
                    label={t('voucher.createForm.descriptionLabel')}
                    value={description}
                    error={validationErrors['description']?.[0]}
                    onChange={e => setDescription(e.currentTarget.value)}
                />

                <Select
                    label={t('voucher.createForm.campaignLabel')}
                    placeholder={t('voucher.createForm.campaignPlaceholder')}
                    data={
                        campaignsRes?.data?.map(c => ({
                            value: c.id,
                            label: c.name,
                        })) || []
                    }
                    value={campaignId}
                    onChange={setCampaignId}
                    clearable
                    searchable
                />
                <Group grow>
                    <Select
                        label={t('voucher.createForm.typeLabel')}
                        data={[
                            { value: 'PERCENTAGE', label: t('voucher.createForm.typePercentage') },
                            { value: 'FIXED_AMOUNT', label: t('voucher.createForm.typeFixed') },
                            { value: 'FREE_SHIPPING', label: t('voucher.createForm.typeFreeship') },
                        ]}
                        value={type}
                        error={validationErrors['type']?.[0]}
                        onChange={v => setType(v as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING')}
                    />
                    <NumberInput
                        label={t('voucher.createForm.valueLabel')}
                        required
                        value={value}
                        error={validationErrors['value']?.[0]}
                        onChange={val => setValue(typeof val === 'number' ? val : '')}
                    />
                </Group>
                <Group grow>
                    <NumberInput
                        label={t('voucher.createForm.minOrderLabel')}
                        value={minOrderValue}
                        error={validationErrors['minOrderValue']?.[0]}
                        onChange={val => setMinOrderValue(typeof val === 'number' ? val : '')}
                    />
                    {type === 'PERCENTAGE' && (
                        <NumberInput
                            label={t('voucher.createForm.maxDiscountLabel')}
                            value={maxDiscount}
                            error={validationErrors['maxDiscount']?.[0]}
                            onChange={val => setMaxDiscount(typeof val === 'number' ? val : '')}
                        />
                    )}
                </Group>
                <Group grow>
                    <NumberInput
                        label={t('voucher.createForm.usageLimitLabel')}
                        value={usageLimit}
                        error={validationErrors['usageLimit']?.[0]}
                        onChange={val => setUsageLimit(typeof val === 'number' ? val : '')}
                    />
                    <NumberInput
                        label={t('voucher.createForm.perUserLimitLabel')}
                        required
                        min={1}
                        value={perUserLimit}
                        error={validationErrors['perUserLimit']?.[0]}
                        onChange={val => setPerUserLimit(typeof val === 'number' ? val : '')}
                    />
                </Group>
                <Group grow>
                    <TextInput
                        type="date"
                        label={t('voucher.createForm.startDateLabel')}
                        required
                        value={startDate}
                        error={validationErrors['startDate']?.[0]}
                        onChange={e => setStartDate(e.currentTarget.value)}
                    />
                    <TextInput
                        type="date"
                        label={t('voucher.createForm.endDateLabel')}
                        required
                        value={endDate}
                        error={validationErrors['endDate']?.[0]}
                        onChange={e => setEndDate(e.currentTarget.value)}
                    />
                </Group>

                <Group justify="right" mt="md">
                    <Button onClick={handleSubmit} loading={mutation.isPending}>
                        {isUpdate ? t('voucher.createForm.submitUpdate') : t('voucher.createForm.submitCreate')}
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
