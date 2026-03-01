'use client';

import { useCallback, useMemo } from 'react';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { voucherService } from '@/services/voucher.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { IconTicket } from '@tabler/icons-react';
import { Switch, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CreateVoucherForm } from '@/components/CreateVoucherForm';
import type { Voucher } from '@/services/voucher.service';

export default function AdminVouchersPage() {
    const queryClient = useQueryClient();
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['admin-vouchers'],
        queryFn: () => voucherService.getAdminVouchers(),
    });

    const mutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            voucherService.update(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật trạng thái thành công',
                color: 'green',
            });
        },
    });

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Voucher>('Voucher');

    const renderTabContent = useCallback((tab: TabItem<Voucher>) => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <CreateVoucherForm
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

    const columnDefs = useMemo<ColDef<Voucher>[]>(
        () => [
            {
                headerName: 'Người tạo',
                field: 'sellerId',
                width: 120,
                cellRenderer: (params: ICellRendererParams) => (
                    <Text size="sm" fw={500} c={params.value ? 'violet' : 'blue'}>
                        {params.value ? 'Seller' : 'Platform'}
                    </Text>
                ),
            },
            { headerName: 'Mã', field: 'code', width: 150, cellStyle: { fontWeight: 600 } },
            {
                headerName: 'Loại',
                field: 'type',
                width: 130,
                valueFormatter: (params) => {
                    const t = params.value;
                    if (t === 'PERCENTAGE') return 'Giảm %';
                    if (t === 'FREE_SHIPPING') return 'Freeship';
                    return 'Giảm tiền';
                }
            },
            {
                headerName: 'Giá trị',
                field: 'value',
                width: 120,
                valueFormatter: (params) => {
                    if (!params.data) return '';
                    return params.data.type === 'PERCENTAGE'
                        ? `${params.value}%`
                        : `${params.value.toLocaleString()}đ`;
                }
            },
            {
                headerName: 'Đã dùng',
                field: 'usedCount',
                width: 120,
                valueFormatter: (params) => {
                    if (!params.data) return '';
                    const limit = params.data.usageLimit;
                    return `${params.value} ${limit ? `/ ${limit}` : ''}`;
                }
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
        <ManagementPage<Voucher>
            entityName="Voucher"
            rowData={useMemo(() => res?.data || [], [res?.data])}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm mã voucher..."
            listIcon={<IconTicket size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
