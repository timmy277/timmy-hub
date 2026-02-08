'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Badge,
    Group,
    Text,
    Avatar,
    Stack,
    Paper,
    Title,
    Card,
    Divider,
} from '@mantine/core';
import { ManagementPage } from '@/components/shared/ManagementPage';
import {
    useUsers,
    useToggleUserStatusMutation,
} from '@/hooks/useUsers';

import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { User } from '@/types/auth';
import { CreateUserForm } from './CreateUserForm';
import { UpdateUserForm } from './UpdateUserForm';
import { ColDef } from 'ag-grid-community';
import { ManagementTabType } from '@/types/enums';
import { createUserColumns, createActionColumn } from '@/constants/column';

export function UserManagementPage() {
    const { t, i18n } = useTranslation();
    const { data: response, isLoading, refetch } = useUsers();
    const toggleStatusMutation = useToggleUserStatusMutation();
    const { activeTab, setActiveTab, openTabs, closeTab, handleAction } = useManagementTabs<User>('User');

    const columnDefs = useMemo<ColDef<User>[]>(() => [
        ...createUserColumns({ t }),
        createActionColumn<User>({
            onDetail: (user) => handleAction('Detail', user),
            onUpdate: (user) => handleAction('Update', user),
            onToggleStatus: (user) => toggleStatusMutation.mutate(user.id),
            isToggleLoading: toggleStatusMutation.isPending,
            toggleLoadingId: toggleStatusMutation.variables as string,
        }, { t })
    ], [t, handleAction, toggleStatusMutation]);

    const renderTabContent = (tab: TabItem<User>) => {
        if (tab.type === ManagementTabType.CREATE) {
            return (
                <CreateUserForm
                    onSuccess={() => closeTab(ManagementTabType.CREATE)}
                    onCancel={() => closeTab(ManagementTabType.CREATE)}
                />
            );
        }

        const user = tab.data;
        if (!user) return null;

        if (tab.type === ManagementTabType.UPDATE) {
            return (
                <UpdateUserForm
                    user={user}
                    onSuccess={() => closeTab(tab.id)}
                    onCancel={() => closeTab(tab.id)}
                />
            );
        }

        return (
            <Paper withBorder p="xl" radius="md" mt="md">
                <Stack>
                    <Group justify="space-between">
                        <Title order={3}>
                            {t('userManagement.userDetails', { email: user.email })}
                        </Title>
                        <Badge size="lg" color={user.isActive ? 'green' : 'red'}>
                            {user.isActive ? t('table.status.active') : t('table.status.inactive')}
                        </Badge>
                    </Group>

                    <Divider />

                    <Group align="flex-start" gap="xl">
                        <Stack gap="xs" style={{ flex: 1 }}>
                            <Text fw={700}>{t('userManagement.basicInfo')}</Text>
                            <Card withBorder padding="md">
                                <Stack gap="xs">
                                    <Group>
                                        <Text fw={500} w={100}>{t('userManagement.avatar')}:</Text>
                                        <Avatar src={user.profile?.avatar || ''} radius="xl" color="blue">
                                            {user.profile?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Group>
                                    <Group>
                                        <Text fw={500} w={100}>{t('userManagement.fullName')}:</Text>
                                        <Text>{user.profile?.firstName} {user.profile?.lastName}</Text>
                                    </Group>
                                    <Group>
                                        <Text fw={500} w={100}>{t('userManagement.email')}:</Text>
                                        <Text>{user.email}</Text>
                                    </Group>
                                    <Group>
                                        <Text fw={500} w={100}>{t('userManagement.role')}:</Text>
                                        <Text>{t(`roles.${user.role}`)}</Text>
                                    </Group>
                                    <Group>
                                        <Text fw={500} w={100}>{t('userManagement.phone')}:</Text>
                                        <Text>{user.phone || 'N/A'}</Text>
                                    </Group>
                                    <Group>
                                        <Text fw={500} w={100}>{t('userManagement.id')}:</Text>
                                        <Text size="xs" c="dimmed">{user.id}</Text>
                                    </Group>
                                </Stack>
                            </Card>
                        </Stack>
                    </Group>
                </Stack>
            </Paper>
        );
    };

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
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );

}
