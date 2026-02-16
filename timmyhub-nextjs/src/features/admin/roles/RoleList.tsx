'use client';

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { IconShieldLock, IconAlertTriangle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { Role } from '@/types/rbac';
import { createRoleColumns, createActionColumn } from '@/constants/column';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { useRoles, useDeleteRoleMutation } from '@/hooks/useRbac';
import { CreateUpdateRole } from './CreateUpdateRole';
import { RoleDetail } from './RoleDetail';

export function RoleList() {
    // ===== Hooks & Context =====
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useRoles();
    const deleteRoleMutation = useDeleteRoleMutation();

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Role>('Role');

    // ===== Component Logic =====
    const renderTabContent = (tab: TabItem<Role>) => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <CreateUpdateRole
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
                    <CreateUpdateRole
                        key={tab.id}
                        role={tab.data}
                        onSuccess={() => {
                            setActiveTab(ManagementTabType.LIST);
                        }}
                        onCancel={() => {
                            closeTab(tab.id);
                        }}
                    />
                ) : null;
            case ManagementTabType.DETAIL:
                return tab.data ? <RoleDetail role={tab.data} /> : null;
            default:
                return null;
        }
    };

    // ===== Event Handlers =====
    const handleDeleteRole = useCallback(
        (role: Role) => {
            modals.openConfirmModal({
                title: (
                    <Text fw={600} size="lg">
                        {t('rbac.deleteRole')}
                    </Text>
                ),
                children: (
                    <Text size="sm">
                        {t('rbac.confirmDelete', { name: role.displayName || role.name })}
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
                    deleteRoleMutation.mutate(role.id);
                },
            });
        },
        [t, deleteRoleMutation],
    );

    const columnDefs = useMemo<ColDef<Role>[]>(
        () => [
            ...createRoleColumns({ t }),
            createActionColumn<Role>(
                {
                    onDetail: role => handleAction('Detail', role),
                    onUpdate: role => handleAction('Update', role),
                    onDelete: handleDeleteRole,
                },
                { t },
            ),
        ],
        [t, handleAction, handleDeleteRole],
    );

    // ===== Final Render =====
    return (
        <ManagementPage<Role>
            entityName="Role"
            rowData={useMemo(() => response?.data || [], [response?.data])}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder={t('rbac.searchPlaceholder')}
            listIcon={<IconShieldLock size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
