'use client';

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { IconKey, IconAlertTriangle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { Permission } from '@/types/rbac';
import { createPermissionColumns, createActionColumn } from '@/constants/column';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { usePermissions, useDeletePermissionMutation } from '@/hooks/useRbac';
import { CreateUpdatePermission } from './CreateUpdatePermission';

export function PermissionList() {
    // ===== Hooks & Context =====
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = usePermissions();
    const deleteMutation = useDeletePermissionMutation();

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Permission>('Permission');

    // ===== Component Logic =====
    const renderTabContent = useCallback((tab: TabItem<Permission>) => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <CreateUpdatePermission
                        key={tab.id}
                        onSuccess={() => {
                            setActiveTab(ManagementTabType.LIST);
                        }}
                        onCancel={() => {
                            closeTab(tab.id);
                        }}
                    />
                );
            case ManagementTabType.UPDATE:
                return tab.data ? (
                    <CreateUpdatePermission
                        key={tab.id}
                        permission={tab.data}
                        onSuccess={() => {
                            setActiveTab(ManagementTabType.LIST);
                        }}
                        onCancel={() => {
                            closeTab(tab.id);
                        }}
                    />
                ) : null;
            default:
                return null;
        }
    }, [setActiveTab, closeTab]);

    // ===== Event Handlers =====
    const handleDelete = useCallback(
        (permission: Permission) => {
            modals.openConfirmModal({
                title: (
                    <Text fw={600} size="lg">
                        {t('rbac.deletePermission')}
                    </Text>
                ),
                children: (
                    <Text size="sm">
                        {t('rbac.confirmDelete', { name: permission.displayName || permission.name })}
                    </Text>
                ),
                labels: {
                    confirm: t('common.delete'),
                    cancel: t('common.cancel'),
                },
                confirmProps: {
                    color: 'red',
                    leftSection: <IconAlertTriangle size={16} />,
                },
                onConfirm: () => {
                    deleteMutation.mutate(permission.id);
                },
            });
        },
        [t, deleteMutation],
    );

    const columnDefs = useMemo<ColDef<Permission>[]>(
        () => [
            ...createPermissionColumns({ t }),
            createActionColumn<Permission>(
                {
                    onUpdate: permission => handleAction('Update', permission),
                    onDelete: handleDelete,
                },
                { t },
            ),
        ],
        [t, handleAction, handleDelete],
    );

    // ===== Final Render =====
    return (
        <ManagementPage<Permission>
            entityName="Permission"
            rowData={useMemo(() => response?.data || [], [response?.data])}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder={t('rbac.searchPermissionPlaceholder')}
            listIcon={<IconKey size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
