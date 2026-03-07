'use client';

import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { IconUsers, IconAlertTriangle } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/navigation';
import { Text } from '@mantine/core';
import { User } from '@/types/auth';
import { createUserColumns, createActionColumn } from '@/constants/column';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { useUsers, useToggleUserStatusMutation } from '@/hooks/useUsers';
import { CreateUpdateUser } from './CreateUpdateUser';
import { UserDetail } from './UserDetail';

export function UserList() {
    // ===== Hooks & Context =====
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useUsers();
    const toggleStatusMutation = useToggleUserStatusMutation();
    const router = useRouter();

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<User>('User');

    // ===== Component Logic =====
    const renderTabContent = useCallback((tab: TabItem<User>) => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <CreateUpdateUser
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
                    <CreateUpdateUser
                        key={tab.id}
                        user={tab.data}
                        onSuccess={() => {
                            setActiveTab(ManagementTabType.LIST);
                        }}
                        onCancel={() => {
                            closeTab(tab.id);
                        }}
                    />
                ) : null;
            case ManagementTabType.DETAIL:
                return tab.data ? <UserDetail user={tab.data} /> : null;
            default:
                return null;
        }
    }, [setActiveTab, closeTab]);

    // ===== Event Handlers =====
    const handleToggleStatus = useCallback(
        (user: User) => {
            const actionText = user.isActive
                ? t('userManagement.lockAccount')
                : t('userManagement.unlockAccount');

            modals.openConfirmModal({
                title: (
                    <Text fw={600} size="lg">
                        {actionText}
                    </Text>
                ),
                children: (
                    <Text size="sm">
                        {user.isActive
                            ? t('userManagement.confirmLock', { email: user.email })
                            : t('userManagement.confirmUnlock', { email: user.email })}
                    </Text>
                ),
                labels: {
                    confirm: actionText,
                    cancel: t('common.cancel'),
                },
                confirmProps: {
                    color: user.isActive ? 'red' : 'green',
                    leftSection: <IconAlertTriangle size={16} />,
                },
                onConfirm: () => {
                    toggleStatusMutation.mutate(user.id);
                },
            });
        },
        [t, toggleStatusMutation],
    );

    const handleMessage = useCallback((user: User) => {
        router.push(`/admin/chat?userId=${user.id}`);
    }, [router]);

    const columnDefs = useMemo<ColDef<User>[]>(
        () => [
            ...createUserColumns({ t }),
            createActionColumn<User>(
                {
                    onDetail: user => handleAction('Detail', user),
                    onUpdate: user => handleAction('Update', user),
                    onToggleStatus: handleToggleStatus,
                    onMessage: handleMessage,
                },
                { t },
            ),
        ],
        [t, handleAction, handleToggleStatus, handleMessage],
    );

    // ===== Final Render =====
    return (
        <ManagementPage<User>
            entityName="User"
            rowData={useMemo(() => response?.data || [], [response?.data])}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder={t('userManagement.searchPlaceholder')}
            listIcon={<IconUsers size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
