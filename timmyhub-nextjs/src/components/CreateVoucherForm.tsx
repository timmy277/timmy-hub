import { useState } from 'react';
import { Button, TextInput, Select, NumberInput, Group, Stack, Paper } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherService, Voucher } from '@/services/voucher.service';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';

export function CreateVoucherForm({ onSuccessCallback }: { onSuccessCallback?: () => void }) {
    const queryClient = useQueryClient();
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'>('PERCENTAGE');
    const [value, setValue] = useState<number | ''>('');
    const [minOrderValue, setMinOrderValue] = useState<number | ''>('');
    const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
    const [usageLimit, setUsageLimit] = useState<number | ''>('');
    const [perUserLimit, setPerUserLimit] = useState<number | ''>(1);
    const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().add(7, 'day').format('YYYY-MM-DD'));

    const mutation = useMutation({
        mutationFn: (data: Partial<Voucher>) => voucherService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
            notifications.show({
                title: 'Thành công',
                message: 'Tạo voucher thành công',
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
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (err: AxiosError<{ message?: string; error?: string[] }>) => {
            notifications.show({
                title: 'Lỗi',
                message:
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.[0] ||
                    'Không thể tạo voucher',
                color: 'red',
            });
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            code,
            description,
            type,
            value: Number(value),
            minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
            maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
            usageLimit: usageLimit ? Number(usageLimit) : undefined,
            perUserLimit: Number(perUserLimit),
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            // Remove isActive because it's not accepted by CreateVoucherDto
        });
    };

    return (
        <Paper withBorder radius="md" p="lg" mt="md">
            <Stack gap="md" maw={600}>
                <TextInput
                    label="Mã Voucher"
                    required
                    value={code}
                    onChange={e => setCode(e.currentTarget.value)}
                />
                <TextInput
                    label="Mô tả"
                    value={description}
                    onChange={e => setDescription(e.currentTarget.value)}
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
                        onChange={v => setType(v as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING')}
                    />
                    <NumberInput
                        label="Giá trị"
                        required
                        value={value}
                        onChange={val => setValue(typeof val === 'number' ? val : '')}
                    />
                </Group>
                <Group grow>
                    <NumberInput
                        label="Đơn tối thiểu"
                        value={minOrderValue}
                        onChange={val => setMinOrderValue(typeof val === 'number' ? val : '')}
                    />
                    {type === 'PERCENTAGE' && (
                        <NumberInput
                            label="Giảm tối đa"
                            value={maxDiscount}
                            onChange={val => setMaxDiscount(typeof val === 'number' ? val : '')}
                        />
                    )}
                </Group>
                <Group grow>
                    <NumberInput
                        label="Giới hạn dùng (Tổng)"
                        value={usageLimit}
                        onChange={val => setUsageLimit(typeof val === 'number' ? val : '')}
                    />
                    <NumberInput
                        label="Giới hạn mỗi user"
                        required
                        value={perUserLimit}
                        onChange={val => setPerUserLimit(typeof val === 'number' ? val : '')}
                    />
                </Group>
                <Group grow>
                    <TextInput
                        type="date"
                        label="Ngày bắt đầu"
                        required
                        value={startDate}
                        onChange={e => setStartDate(e.currentTarget.value)}
                    />
                    <TextInput
                        type="date"
                        label="Ngày kết thúc"
                        required
                        value={endDate}
                        onChange={e => setEndDate(e.currentTarget.value)}
                    />
                </Group>

                <Group justify="right" mt="md">
                    <Button onClick={handleSubmit} loading={mutation.isPending}>
                        Hoàn tất tạo
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
