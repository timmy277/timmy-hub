'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { IconUsers } from '@tabler/icons-react';
import { User } from '@/types/auth';
import { createUserColumns, createActionColumn } from '@/constants/column';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { useUsers } from '@/hooks/useUsers';
import { CreateUpdateUser } from './CreateUpdateUser';
import { UserDetail } from './UserDetail';

export function UserList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useUsers();

    const {
        activeTab,
        setActiveTab,
        openTabs,
        handleAction,
        closeTab,
    } = useManagementTabs<User>('User');

    // Render tab content based on tab type
    const renderTabContent = (tab: TabItem<User>) => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <CreateUpdateUser
                        onSuccess={() => {
                            refetch();
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
                        user={tab.data}
                        onSuccess={() => {
                            refetch();
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
    };

    const columnDefs = useMemo<ColDef<User>[]>(() => [
        ...createUserColumns({ t }),
        createActionColumn<User>({
            onDetail: (user) => handleAction('Detail', user),
            onUpdate: (user) => handleAction('Update', user),
            onToggleStatus: async (user) => {
                // TODO: Implement toggle status
                console.log('Toggle status for user:', user);
            },
        }, { t })
    ], [t, handleAction]);

    return (
        <ManagementPage<User>
            title={t('userManagement.title')}
            entityName="User"
            rowData={response?.data || []}
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
