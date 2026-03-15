'use client';

import { useCallback, useMemo } from 'react';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { campaignService, Campaign } from '@/services/campaign.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import Iconify from '@/components/iconify/Iconify';
import { Switch, Badge, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { CreateCampaignForm } from '@/features/campaigns/components/CreateCampaignForm';
import { CampaignDetail } from '@/features/campaigns/components/CampaignDetail';
import { getActionColumn } from '@/constants/column';

export function AdminCampaignList() {
    const queryClient = useQueryClient();
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS,
        queryFn: () => campaignService.getAdminCampaigns(),
    });

    const mutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            campaignService.update(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật trạng thái thành công',
                color: 'green',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => campaignService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_CAMPAIGNS });
            notifications.show({
                title: 'Thành công',
                message: 'Đã xóa chương trình khuyến mãi',
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa campaign này',
                color: 'red',
            });
        },
    });

    const handleDelete = useCallback((item: Campaign) => {
        modals.openConfirmModal({
            title: <Text fw={600} size="lg">Xóa Campaign</Text>,
            children: <Text size="sm">Bạn có chắc chắn muốn xóa campaign {item.name} này không?</Text>,
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red', leftSection: <Iconify icon="tabler:alert-triangle" width={16} /> },
            onConfirm: () => deleteMutation.mutate(item.id),
        });
    }, [deleteMutation]);

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
                return tab.data ? (
                    <CreateCampaignForm
                        initialData={tab.data}
                        onSuccessCallback={() => {
                            setActiveTab(ManagementTabType.LIST);
                            closeTab(tab.id);
                            refetch();
                        }}
                    />
                ) : null;
            case ManagementTabType.DETAIL:
                return tab.data ? (
                    <CampaignDetail campaign={tab.data} />
                ) : null;
            default:
                return null;
        }
    }, [setActiveTab, refetch, closeTab]);

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
                        <div className="flex items-center h-full">
                            <Switch
                                checked={params.value}
                                onChange={e =>
                                    mutation.mutate({
                                        id: params.data!.id,
                                        isActive: e.currentTarget.checked,
                                    })
                                }
                            />
                        </div>
                    );
                },
            },
            getActionColumn({
                onDetail: data => handleAction('Detail', data),
                onUpdate: data => handleAction('Update', data),
                onDelete: handleDelete,
            })
        ],
        [mutation, handleAction, handleDelete],
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
            listIcon={<Iconify icon="tabler:discount" width={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
