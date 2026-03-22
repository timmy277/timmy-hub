'use client';

import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAction } from 'next-safe-action/hooks';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';
import { Box } from '@mantine/core';
import { ColDef } from 'ag-grid-community';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { getActionColumn } from '@/constants/column';
import { WardForm, WardFormValues } from './LocationForms';
import {
    createWardAction,
    updateWardAction,
    deleteWardAction,
} from '@/actions/location.actions';
import type { Ward } from '@/types/location';
import { useWards } from '@/hooks/useLocations';

export default function WardList() {
    const { t } = useTranslation();

    const { data: wards, isLoading, refetch } = useWards();

    const rowData: Ward[] = wards ?? [];

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Ward>('Ward');

    // ===== Server Actions =====
    const { execute: create, isPending: isCreating } = useAction(createWardAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Tạo phường/xã thành công',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            closeTab(ManagementTabType.CREATE);
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi tạo phường/xã',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    const { execute: update, isPending: isUpdating } = useAction(updateWardAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Cập nhật phường/xã thành công',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            openTabs.forEach(tab => {
                if (tab.type === ManagementTabType.UPDATE) closeTab(tab.id);
            });
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi cập nhật phường/xã',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    const { execute: remove, isPending: isDeleting } = useAction(deleteWardAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Đã xóa phường/xã',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi xóa phường/xã',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    // ===== Event Handlers =====
    const handleCreate = useCallback((values: WardFormValues) => {
        create(values);
    }, [create]);

    const handleUpdate = useCallback((code: string, values: WardFormValues) => {
        update({ code, data: values });
    }, [update]);

    const handleDelete = useCallback((ward: Ward) => {
        if (window.confirm(`Xóa "${ward.name}"?`)) {
            remove({ code: ward.code });
        }
    }, [remove]);

    // ===== Table Columns =====
    const columnDefs = useMemo<ColDef<Ward>[]>(() => [
        { field: 'code', headerName: 'Mã', width: 100, sortable: true, filter: true },
        { field: 'districtCode', headerName: 'Mã quận', width: 100, sortable: true, filter: true },
        { field: 'name', headerName: 'Tên phường/xã', flex: 1, sortable: true, filter: true },
        { field: 'slug', headerName: 'Slug', flex: 1, sortable: true, filter: true },
    ], []);

    const actionCol = useMemo(() => getActionColumn<Ward>({
        onUpdate: (data) => handleAction('Update', data),
        onDelete: handleDelete,
    }), [handleAction, handleDelete]);

    const allColumns = useMemo(() => [...columnDefs, actionCol], [columnDefs, actionCol]);

    const renderTabContent = useCallback((tab: TabItem<Ward>): ReactNode => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <Box p="xl">
                        <WardForm onSubmit={handleCreate} isLoading={isCreating} />
                    </Box>
                );
            case ManagementTabType.UPDATE:
                return (
                    <Box p="xl">
                        <WardForm
                            initialValues={tab.data ?? undefined}
                            onSubmit={(values) => handleUpdate(tab.data!.code, values)}
                            isLoading={isUpdating}
                        />
                    </Box>
                );
            default:
                return null;
        }
    }, [handleCreate, handleUpdate, isCreating, isUpdating]);

    return (
        <ManagementPage<Ward>
            entityName="Phường/Xã"
            rowData={rowData}
            columnDefs={allColumns}
            isLoading={isLoading || isDeleting}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm phường/xã..."
            listIcon={<Iconify icon="tabler:home" width={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
