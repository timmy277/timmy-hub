'use client';

import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAction } from 'next-safe-action/hooks';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';
import { Box } from '@mantine/core';
import { ColDef } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';

import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { getActionColumn } from '@/constants/column';
import { DistrictForm, DistrictFormValues } from './LocationForms';
import {
    createDistrictAction,
    updateDistrictAction,
    deleteDistrictAction,
} from '@/actions/location.actions';
import type { District } from '@/types/location';
import { useDistricts, useProvinces } from '@/hooks/useLocations';

export default function DistrictList() {
    const { t } = useTranslation();

    const { data: districts, isLoading, refetch } = useDistricts();
    const { data: provinces } = useProvinces();

    const provinceOptions = (provinces ?? []).map(p => ({ code: p.code, name: p.name }));

    const rowData: District[] = districts ?? [];

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<District>('District');

    // ===== Server Actions =====
    const { execute: create, isPending: isCreating } = useAction(createDistrictAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Tạo quận/huyện thành công',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            closeTab(ManagementTabType.CREATE);
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi tạo quận/huyện',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    const { execute: update, isPending: isUpdating } = useAction(updateDistrictAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Cập nhật quận/huyện thành công',
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
                message: error.serverError || 'Lỗi khi cập nhật quận/huyện',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    const { execute: remove, isPending: isDeleting } = useAction(deleteDistrictAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Đã xóa quận/huyện',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi xóa quận/huyện',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        },
    });

    // ===== Event Handlers =====
    const handleCreate = useCallback((values: DistrictFormValues) => {
        create(values);
    }, [create]);

    const handleUpdate = useCallback((code: string, values: DistrictFormValues) => {
        update({ code, data: values });
    }, [update]);

    const handleDelete = useCallback((district: District) => {
        if (window.confirm(`Xóa "${district.name}"?`)) {
            remove({ code: district.code });
        }
    }, [remove]);

    // ===== Table Columns =====
    const columnDefs = useMemo<ColDef<District>[]>(() => [
        { field: 'code', headerName: 'Mã', width: 100, sortable: true, filter: true },
        { field: 'provinceCode', headerName: 'Mã tỉnh', width: 100, sortable: true, filter: true },
        { field: 'name', headerName: 'Tên quận/huyện', flex: 1, sortable: true, filter: true },
        { field: 'slug', headerName: 'Slug', flex: 1, sortable: true, filter: true },
    ], []);

    const actionCol = useMemo(() => getActionColumn<District>({
        onUpdate: (data) => handleAction('Update', data),
        onDelete: handleDelete,
    }), [handleAction, handleDelete]);

    const allColumns = useMemo(() => [...columnDefs, actionCol], [columnDefs, actionCol]);

    const renderTabContent = useCallback((tab: TabItem<District>): ReactNode => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <Box p="xl">
                        <DistrictForm onSubmit={handleCreate} isLoading={isCreating} provinces={provinceOptions} />
                    </Box>
                );
            case ManagementTabType.UPDATE:
                return (
                    <Box p="xl">
                        <DistrictForm
                            initialValues={tab.data ?? undefined}
                            onSubmit={(values) => handleUpdate(tab.data!.code, values)}
                            isLoading={isUpdating}
                            provinces={provinceOptions}
                        />
                    </Box>
                );
            default:
                return null;
        }
    }, [handleCreate, handleUpdate, isCreating, isUpdating, provinceOptions]);

    return (
        <ManagementPage<District>
            entityName="Quận/Huyện"
            rowData={rowData}
            columnDefs={allColumns}
            isLoading={isLoading || isDeleting}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm quận/huyện..."
            listIcon={<Iconify icon="tabler:building" width={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
