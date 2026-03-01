import { useState } from 'react';
import { Button, TextInput, Checkbox, Group, Stack, Paper, Select } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService, Campaign } from '@/services/campaign.service';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';

export function CreateCampaignForm({ 
    onSuccessCallback, 
    initialData,
}: { 
    onSuccessCallback?: () => void;
    initialData?: Campaign;
}) {
    const queryClient = useQueryClient();
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [type, setType] = useState(initialData?.type || 'VOUCHER_CAMPAIGN');
    const [startDate, setStartDate] = useState(initialData?.startDate ? dayjs(initialData.startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(initialData?.endDate ? dayjs(initialData.endDate).format('YYYY-MM-DD') : dayjs().add(30, 'day').format('YYYY-MM-DD'));
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

    const isUpdate = !!initialData;

    const mutation = useMutation({
        mutationFn: (data: Partial<Campaign>) => 
            isUpdate ? campaignService.update(initialData.id, data) : campaignService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
            notifications.show({
                title: 'Thành công',
                message: isUpdate ? 'Cập nhật chương trình khuyến mãi thành công' : 'Tạo chương trình khuyến mãi thành công',
                color: 'green',
            });
            setName('');
            setDescription('');
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (err: AxiosError<{ message?: string; error?: string[] }>) => {
            notifications.show({
                title: 'Lỗi',
                message:
                    err?.response?.data?.message ||
                    err?.response?.data?.error?.[0] ||
                    (isUpdate ? 'Không thể cập nhật campaign' : 'Không thể tạo campaign'),
                color: 'red',
            });
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            name,
            description,
            type,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            isActive,
        });
    };

    return (
        <Paper withBorder radius="md" p="lg" mt="md">
            <Stack gap="md" maw={600}>
                <TextInput
                    label="Tên Campaign"
                    required
                    value={name}
                    onChange={e => setName(e.currentTarget.value)}
                />
                <TextInput
                    label="Mô tả"
                    value={description}
                    onChange={e => setDescription(e.currentTarget.value)}
                />
                <Select
                    label="Loại Campaign"
                    data={[
                        { value: 'VOUCHER_CAMPAIGN', label: 'Voucher Campaign' },
                        { value: 'FLASH_SALE', label: 'Flash Sale' },
                        { value: 'CATEGORY_SALE', label: 'Category Sale' },
                        { value: 'EVENT', label: 'Event' },
                    ]}
                    value={type}
                    onChange={v => setType(v as string)}
                />
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
                <Checkbox
                    label="Kích hoạt ngay"
                    checked={isActive}
                    onChange={e => setIsActive(e.currentTarget.checked)}
                    mt="sm"
                />
                <Group justify="right" mt="md">
                    <Button onClick={handleSubmit} loading={mutation.isPending}>
                        {isUpdate ? 'Cập nhật' : 'Hoàn tất tạo'}
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
