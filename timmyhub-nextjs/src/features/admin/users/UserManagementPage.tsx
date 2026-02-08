'use client';

import { useMemo, useState } from 'react';
import {
    Badge,
    Group,
    ActionIcon,
    Tooltip,
    Text,
    Avatar,
    Stack,
    Paper,
    Title,
    Select,
    Button,
    Card,
    Divider,
    TextInput,
    PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconEye,
    IconEdit,
    IconLock,
    IconLockOpen,
    IconShieldCheck
} from '@tabler/icons-react';
import { ManagementPage } from '@/components/shared/ManagementPage';
import {
    useUsers,
    useToggleUserStatusMutation,
    useAssignUserRolesMutation,
    useCreateUserMutation
} from '@/hooks/useUsers';

import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { User } from '@/types/auth';
import { CreateUserForm } from './CreateUserForm';
import { UpdateUserForm } from './UpdateUserForm';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { ManagementTabType, UserRole } from '@/types/enums';

export function UserManagementPage() {
    const { data: response, isLoading, refetch } = useUsers();
    const toggleStatusMutation = useToggleUserStatusMutation();
    const assignRolesMutation = useAssignUserRolesMutation();
    const { activeTab, setActiveTab, openTabs, closeTab, handleAction } = useManagementTabs<User>('User');

    // Local state for role editing in tabs
    const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

    const columnDefs = useMemo<ColDef<User>[]>(() => [
        {
            headerName: 'Avatar',
            field: 'profile.avatar',
            width: 100,
            cellStyle: { display: 'flex', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<User>) => (
                <Avatar src={params.data?.profile?.avatar || ''} radius="xl" color="blue">
                    {params.data?.profile?.firstName?.charAt(0) || params.data?.email.charAt(0).toUpperCase()}
                </Avatar>
            )
        },
        {
            headerName: 'Tên',
            field: 'profile.firstName',
            minWidth: 150,
            valueGetter: (params) => {
                if (!params.data?.profile) return 'Chưa cập nhật';
                return `${params.data.profile.firstName} ${params.data.profile.lastName}`;
            }
        },
        {
            headerName: 'Email',
            field: 'email',
            minWidth: 200,
        },
        {
            headerName: 'Vai trò',
            field: 'role',
            width: 150,
            cellRenderer: (params: ICellRendererParams<User>) => (
                <Badge
                    color={params.value === UserRole.ADMIN || params.value === UserRole.SUPER_ADMIN ? 'red' : params.value === UserRole.SELLER ? 'blue' : 'gray'}
                    variant="light"
                    mt={10}
                >
                    {params.value}
                </Badge>
            )
        },
        {
            headerName: 'Trạng thái',
            field: 'isActive',
            width: 150,
            cellRenderer: (params: ICellRendererParams<User>) => (
                <Badge
                    color={params.value ? 'green' : 'red'}
                    variant="dot"
                    mt={10}
                >
                    {params.value ? 'Đang hoạt động' : 'Đã khóa'}
                </Badge>
            )
        },
        {
            headerName: 'Thành viên từ',
            field: 'createdAt',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '01/01/2024',
        },
        {
            headerName: 'Thao tác',
            pinned: 'right',
            width: 150,
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<User>) => {
                if (!params.data) return null;
                const user = params.data;
                const { isActive } = user;

                return (
                    <Group gap="xs" mt={4}>
                        <Tooltip label="Xem chi tiết">
                            <ActionIcon variant="light" color="blue" onClick={() => handleAction('Detail', user)}>
                                <IconEye size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Sửa vai trò">
                            <ActionIcon variant="light" color="orange" onClick={() => handleAction('Update', user)}>
                                <IconEdit size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={isActive ? 'Khóa tài khoản' : 'Mở khóa'}>
                            <ActionIcon
                                variant="light"
                                color={isActive ? 'red' : 'green'}
                                loading={toggleStatusMutation.isPending && toggleStatusMutation.variables === user.id}
                                onClick={() => toggleStatusMutation.mutate(user.id)}
                            >
                                {isActive ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                );
            }
        }
    ], [handleAction, toggleStatusMutation.isPending, toggleStatusMutation.variables]);


    const handleUpdateRole = (userId: string, tabId: string) => {
        const role = selectedRoles[userId];
        if (role) {
            assignRolesMutation.mutate(
                { id: userId, roleNames: [role] },
                {
                    onSuccess: () => {
                        closeTab(tabId);
                        setSelectedRoles(prev => {
                            const newRoles = { ...prev };
                            delete newRoles[userId];
                            return newRoles;
                        });
                    }
                }
            );
        }
    };

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
                            Chi tiết người dùng: {user.email}
                        </Title>
                        <Badge size="lg" color={user.isActive ? 'green' : 'red'}>
                            {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                    </Group>

                    <Divider />

                    <Group align="flex-start" gap="xl">
                        <Stack gap="xs" style={{ flex: 1 }}>
                            <Text fw={700}>Thông tin cơ bản</Text>
                            <Card withBorder padding="md">
                                <Stack gap="xs">
                                    <Group><Text fw={500} w={100}>Avatar:</Text>
                                        <Avatar src={user.profile?.avatar || ''} radius="xl" color="blue">
                                            {user.profile?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Group>
                                    <Group><Text fw={500} w={100}>Họ tên:</Text><Text>{user.profile?.firstName} {user.profile?.lastName}</Text></Group>
                                    <Group><Text fw={500} w={100}>Email:</Text><Text>{user.email}</Text></Group>
                                    <Group><Text fw={500} w={100}>Role:</Text><Text>{user.role}</Text></Group>
                                    <Group><Text fw={500} w={100}>Điện thoại:</Text><Text>{user.phone || 'N/A'}</Text></Group>
                                    <Group><Text fw={500} w={100}>ID:</Text><Text size="xs" c="dimmed">{user.id}</Text></Group>
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
            title="Quản lý người dùng"
            entityName="User"
            rowData={response?.data || []}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm kiếm người dùng theo email, tên..."
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );

}
