import { useState } from 'react';
import { Button, TextInput, Select, NumberInput, Group, Stack, Paper, Alert } from '@mantine/core';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { voucherService, Voucher } from '@/services/voucher.service';
import { campaignService } from '@/services/campaign.service';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';
import { IconInfoCircle } from '@tabler/icons-react';

export function CreateVoucherForm({
    onSuccessCallback,
    initialData,
}: {
    onSuccessCallback?: () => void;
    initialData?: Voucher;
}) {
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
                title: 'Thành công',
                message: isUpdate ? 'Cập nhật voucher thành công' : 'Tạo voucher thành công',
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
                title: 'Lỗi validation',
                message:
                    data?.message ||
                    (Array.isArray(data?.error) ? data.error[0] : data?.error) ||
                    (isUpdate ? 'Không thể cập nhật voucher' : 'Không thể tạo voucher'),
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
                    <Alert icon={<IconInfoCircle size={16} />} color="red" title="Dữ liệu không hợp lệ">
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
                    label="Mã Voucher"
                    description="Chỉ chữ hoa, số và dấu _ (VD: SALE_10)"
                    required
                    value={code}
                    readOnly={isUpdate}
                    error={validationErrors['code']?.[0]}
                    onChange={e => setCode(e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                />
                <TextInput
                    label="Mô tả"
                    value={description}
                    error={validationErrors['description']?.[0]}
                    onChange={e => setDescription(e.currentTarget.value)}
                />

                <Select
                    label="Chương trình khuyến mãi (Tùy chọn)"
                    placeholder="Không áp dụng campaign"
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
                        label="Loại"
                        data={[
                            { value: 'PERCENTAGE', label: 'Phần trăm' },
                            { value: 'FIXED_AMOUNT', label: 'Cố định' },
                            { value: 'FREE_SHIPPING', label: 'Freeship' },
                        ]}
                        value={type}
                        error={validationErrors['type']?.[0]}
                        onChange={v => setType(v as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING')}
                    />
                    <NumberInput
                        label="Giá trị"
                        required
                        value={value}
                        error={validationErrors['value']?.[0]}
                        onChange={val => setValue(typeof val === 'number' ? val : '')}
                    />
                </Group>
                <Group grow>
                    <NumberInput
                        label="Đơn tối thiểu"
                        value={minOrderValue}
                        error={validationErrors['minOrderValue']?.[0]}
                        onChange={val => setMinOrderValue(typeof val === 'number' ? val : '')}
                    />
                    {type === 'PERCENTAGE' && (
                        <NumberInput
                            label="Giảm tối đa"
                            value={maxDiscount}
                            error={validationErrors['maxDiscount']?.[0]}
                            onChange={val => setMaxDiscount(typeof val === 'number' ? val : '')}
                        />
                    )}
                </Group>
                <Group grow>
                    <NumberInput
                        label="Giới hạn dùng (Tổng)"
                        value={usageLimit}
                        error={validationErrors['usageLimit']?.[0]}
                        onChange={val => setUsageLimit(typeof val === 'number' ? val : '')}
                    />
                    <NumberInput
                        label="Giới hạn mỗi user"
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
                        label="Ngày bắt đầu"
                        required
                        value={startDate}
                        error={validationErrors['startDate']?.[0]}
                        onChange={e => setStartDate(e.currentTarget.value)}
                    />
                    <TextInput
                        type="date"
                        label="Ngày kết thúc"
                        required
                        value={endDate}
                        error={validationErrors['endDate']?.[0]}
                        onChange={e => setEndDate(e.currentTarget.value)}
                    />
                </Group>

                <Group justify="right" mt="md">
                    <Button onClick={handleSubmit} loading={mutation.isPending}>
                        {isUpdate ? 'Cập nhật' : 'Hoàn tất tạo'}
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
