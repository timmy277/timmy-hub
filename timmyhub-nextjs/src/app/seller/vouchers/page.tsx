'use client';

import { useCallback, useMemo } from 'react';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { voucherService } from '@/services/voucher.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import Iconify from '@/components/iconify/Iconify';
import { Badge, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { CreateVoucherForm } from '@/components/CreateVoucherForm';
import { VoucherDetail } from '@/components/VoucherDetail';
import { getActionColumn } from '@/constants/column';
import type { Voucher } from '@/services/voucher.service';

export default function SellerVouchersPage() {
    const queryClient = useQueryClient();
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['seller-vouchers'],
        queryFn: () => voucherService.getSellerVouchers(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => voucherService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
            notifications.show({
                title: 'Thành công',
                message: 'Đã xóa voucher',
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa voucher này',
                color: 'red',
            });
        },
    });

    const handleDelete = useCallback((item: Voucher) => {
        modals.openConfirmModal({
            title: <Text fw={600} size="lg">Xóa Voucher</Text>,
            children: <Text size="sm">Bạn có chắc chắn muốn xóa voucher {item.code} này không?</Text>,
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red', leftSection: <Iconify icon="tabler:alert-triangle" width={16} /> },
            onConfirm: () => deleteMutation.mutate(item.id),
        });
    }, [deleteMutation]);

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
                return tab.data ? (
                    <CreateVoucherForm
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
                    <VoucherDetail voucher={tab.data} />
                ) : null;
            default:
                return null;
        }
    }, [setActiveTab, refetch, closeTab]);

    const columnDefs = useMemo<ColDef<Voucher>[]>(
        () => [
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
                headerName: 'Trạng thái',
                field: 'isActive',
                width: 120,
                cellRenderer: (params: ICellRendererParams) => (
                    <Badge color={params.value ? 'green' : 'gray'} variant="light">
                        {params.value ? 'Hoạt động' : 'Đã tắt'}
                    </Badge>
                ),
            },
            getActionColumn({
                onDetail: data => handleAction('Detail', data),
                onUpdate: data => handleAction('Update', data),
                onDelete: handleDelete,
            })
        ],
        [handleAction, handleDelete],
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
            listIcon={<Iconify icon="tabler:ticket" width={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
