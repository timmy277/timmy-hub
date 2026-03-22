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
import { ProvinceForm, ProvinceFormValues } from './LocationForms';
import {
    createProvinceAction,
    updateProvinceAction,
    deleteProvinceAction,
} from '@/actions/location.actions';
import type { Province } from '@/types/location';
import { useProvinces } from '@/hooks/useLocations';

export default function ProvinceList() {
    const { t } = useTranslation();

    const { data: provinces, isLoading, refetch } = useProvinces();

    const rowData: Province[] = provinces ?? [];

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Province>('Province');

    // ===== Server Actions =====
    const { execute: create, isPending: isCreating } = useAction(createProvinceAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Tạo tỉnh/thành thành công',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            closeTab(ManagementTabType.CREATE);
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi tạo tỉnh/thành',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    const { execute: update, isPending: isUpdating } = useAction(updateProvinceAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Cập nhật tỉnh/thành thành công',
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
                message: error.serverError || 'Lỗi khi cập nhật tỉnh/thành',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    const { execute: remove, isPending: isDeleting } = useAction(deleteProvinceAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Đã xóa tỉnh/thành',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi xóa tỉnh/thành',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    // ===== Event Handlers =====
    const handleCreate = useCallback((values: ProvinceFormValues) => {
        create(values);
    }, [create]);

    const handleUpdate = useCallback((code: string, values: ProvinceFormValues) => {
        update({ code, data: values });
    }, [update]);

    const handleDelete = useCallback((province: Province) => {
        if (window.confirm(`Xóa "${province.name}"?`)) {
            remove({ code: province.code });
        }
    }, [remove]);

    // ===== Table Columns =====
    const columnDefs = useMemo<ColDef<Province>[]>(() => [
        { field: 'code', headerName: 'Mã', width: 100, sortable: true, filter: true },
        { field: 'name', headerName: 'Tên tỉnh/thành', flex: 1, sortable: true, filter: true },
        { field: 'slug', headerName: 'Slug', flex: 1, sortable: true, filter: true },
    ], []);

    const actionCol = useMemo(() => getActionColumn<Province>({
        onUpdate: (data) => handleAction('Update', data),
        onDelete: handleDelete,
    }), [handleAction, handleDelete]);

    const allColumns = useMemo(() => [...columnDefs, actionCol], [columnDefs, actionCol]);

    const renderTabContent = useCallback((tab: TabItem<Province>): ReactNode => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <Box p="xl">
                        <ProvinceForm onSubmit={handleCreate} isLoading={isCreating} />
                    </Box>
                );
            case ManagementTabType.UPDATE:
                return (
                    <Box p="xl">
                        <ProvinceForm
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
        <ManagementPage<Province>
            entityName="Tỉnh/Thành"
            rowData={rowData}
            columnDefs={allColumns}
            isLoading={isLoading || isDeleting}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm tỉnh/thành..."
            listIcon={<Iconify icon="tabler:map" width={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
