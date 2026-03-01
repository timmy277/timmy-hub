'use client';

import { useCallback, useMemo } from 'react';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { campaignService } from '@/services/campaign.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { IconDiscount } from '@tabler/icons-react';
import { Switch, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CreateCampaignForm } from '@/components/CreateCampaignForm';
import type { Campaign } from '@/services/campaign.service';

export default function AdminCampaignsPage() {
    const queryClient = useQueryClient();
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['admin-campaigns'],
        queryFn: () => campaignService.getAdminCampaigns(),
    });

    const mutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            campaignService.update(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật trạng thái thành công',
                color: 'green',
            });
        },
    });

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Campaign>('Campaign');

    const renderTabContent = useCallback((tab: TabItem<Campaign>) => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <CreateCampaignForm
                        onSuccessCallback={() => {
                            setActiveTab(ManagementTabType.LIST);
                            refetch();
                        }}
                    />
                );
            case ManagementTabType.UPDATE:
                // ... If edit form exists
                return null;
            case ManagementTabType.DETAIL:
                // ... If detail view exists
                return null;
            default:
                return null;
        }
    }, [setActiveTab, refetch]);

    const columnDefs = useMemo<ColDef<Campaign>[]>(
        () => [
            {
                headerName: 'Loại',
                field: 'type',
                width: 150,
            },
            {
                headerName: 'Phân loại',
                field: 'ownerType',
                width: 120,
                cellRenderer: (params: ICellRendererParams) => (
                    <Badge color={params.value === 'PLATFORM' ? 'blue' : 'violet'}>
                        {params.value}
                    </Badge>
                ),
            },
            { headerName: 'Tên chương trình', field: 'name', width: 250, cellStyle: { fontWeight: 600 } },
            {
                headerName: 'Mô tả',
                field: 'description',
                width: 250,
            },
            {
                headerName: 'Thời gian',
                width: 200,
                valueGetter: (params) => {
                    if (!params.data) return '';
                    return `${dayjs(params.data.startDate).format('DD/MM/YYYY')} - ${dayjs(params.data.endDate).format('DD/MM/YYYY')}`;
                }
            },
            {
                headerName: 'Hoạt động',
                field: 'isActive',
                width: 120,
                cellRenderer: (params: ICellRendererParams) => {
                    if (!params.data) return null;
                    return (
                        <Switch
                            checked={params.value}
                            onChange={e =>
                                mutation.mutate({
                                    id: params.data!.id,
                                    isActive: e.currentTarget.checked,
                                })
                            }
                        />
                    );
                },
            },
        ],
        [mutation],
    );

    return (
        <ManagementPage<Campaign>
            entityName="Campaign"
            rowData={useMemo(() => res?.data || [], [res?.data])}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm campaign..."
            listIcon={<IconDiscount size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
