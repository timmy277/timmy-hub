import { Badge, Group, ActionIcon, Tooltip, Avatar, Stack, Text, Image } from '@mantine/core';
import { IconEye, IconEdit, IconLock, IconLockOpen, IconCheck, IconX, IconStar } from '@tabler/icons-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { User } from '@/types/auth';
import { Role, Permission } from '@/types/rbac';
import { Product, ResourceStatus } from '@/types/product';
import { UserRole } from '@/types/enums';
import { TFunction } from 'i18next';
import { formatDate } from '@/utils/date';
import { IconTrash } from '@tabler/icons-react';

export interface ActionColumnProps<T> {
    onDetail?: (data: T) => void;
    onUpdate?: (data: T) => void;
    onToggleStatus?: (data: T) => void;
    onDelete?: (data: T) => void;
    onApprove?: (data: T) => void;
    onReject?: (data: T) => void;
    isToggleLoading?: boolean;
    toggleLoadingId?: string | null;
}

export interface ColumnConfigOptions {
    t: TFunction;
}

const getRoleColor = (role: UserRole): string => {
    const colorMap: Record<UserRole, string> = {
        [UserRole.SUPER_ADMIN]: 'red',
        [UserRole.ADMIN]: 'red',
        [UserRole.SELLER]: 'blue',
        [UserRole.BRAND]: 'grape',
        [UserRole.SHIPPER]: 'green',
        [UserRole.CUSTOMER]: 'gray',
    };
    return colorMap[role] || 'gray';
};

export const createUserColumns = (options: ColumnConfigOptions): ColDef<User>[] => {
    const { t } = options;

    return [
        {
            headerName: t('table.columns.avatar'),
            field: 'profile.avatar',
            width: 100,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<User>) => {
                const avatar = params.data?.profile?.avatar || '';
                const initial =
                    params.data?.profile?.firstName?.charAt(0) ||
                    params.data?.email.charAt(0).toUpperCase();

                return (
                    <Avatar src={avatar} radius="xl" color="blue" alt="User avatar">
                        {initial}
                    </Avatar>
                );
            },
        },
        {
            headerName: t('table.columns.name'),
            field: 'profile.firstName',
            minWidth: 150,
            valueGetter: params => {
                const profile = params.data?.profile;
                if (!profile) return t('table.columns.notUpdated');
                return `${profile.firstName} ${profile.lastName}`.trim();
            },
        },
        {
            headerName: t('table.columns.email'),
            field: 'email',
            minWidth: 200,
            editable: true,
        },
        {
            headerName: t('table.columns.role'),
            field: 'role',
            width: 150,
            cellRenderer: (params: ICellRendererParams<User>) => {
                const role = params.value as string;
                const translatedRole = t(`roles.${role}`);
                
                // If translation is missing (returns the key), try to use displayName from userRoles
                let displayRole = translatedRole;
                if (translatedRole === `roles.${role}` && params.data?.userRoles?.length) {
                    const dynamicRole = params.data.userRoles.find(ur => ur.role.name === role);
                    if (dynamicRole) {
                        displayRole = dynamicRole.role.displayName;
                    }
                }

                // If still roles.xxx, just show the role name
                if (displayRole === `roles.${role}`) {
                    displayRole = role;
                }

                return (
                    <Badge color={getRoleColor(role as UserRole)} variant="light" mt={10}>
                        {displayRole}
                    </Badge>
                );
            },
        },
        {
            headerName: t('table.columns.status'),
            field: 'isActive',
            width: 150,
            cellRenderer: (params: ICellRendererParams<User>) => {
                const isActive = params.value;
                return (
                    <Badge color={isActive ? 'green' : 'red'} variant="dot" mt={10}>
                        {isActive ? t('table.status.active') : t('table.status.inactive')}
                    </Badge>
                );
            },
        },
        {
            headerName: t('table.columns.memberSince'),
            field: 'createdAt',
            width: 150,
            valueFormatter: params => formatDate(params.value),
        },
    ];
};

export const createPermissionColumns = (options: ColumnConfigOptions): ColDef<Permission>[] => {
    const { t } = options;

    return [
        {
            headerName: t('table.columns.permissionName'),
            field: 'name',
            minWidth: 150,
            cellRenderer: (params: ICellRendererParams<Permission>) => (
                <Badge variant="filled" color="cyan">
                    {params.value}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.displayName'),
            field: 'displayName',
            minWidth: 150,
        },
        {
            headerName: t('table.columns.module'),
            field: 'module',
            width: 120,
            cellRenderer: (params: ICellRendererParams<Permission>) => (
                <Badge variant="light" color="indigo">
                    {params.value}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.action'),
            field: 'action',
            width: 120,
            cellRenderer: (params: ICellRendererParams<Permission>) => (
                <Badge variant="outline" color="teal">
                    {params.value}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.description'),
            field: 'description',
            minWidth: 200,
            flex: 1,
        },
        {
            headerName: t('table.columns.createdAt'),
            field: 'createdAt',
            width: 150,
            valueFormatter: params => formatDate(params.value),
        },
    ];
};

export const createRoleColumns = (options: ColumnConfigOptions): ColDef<Role>[] => {
    const { t } = options;

    return [
        {
            headerName: t('table.columns.roleName'),
            field: 'name',
            minWidth: 150,
            cellRenderer: (params: ICellRendererParams<Role>) => (
                <Badge variant="filled" color={params.data?.isSystem ? 'red' : 'blue'}>
                    {params.value}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.displayName'),
            field: 'displayName',
            minWidth: 150,
        },
        {
            headerName: t('table.columns.description'),
            field: 'description',
            minWidth: 200,
            flex: 1,
        },
        {
            headerName: t('table.columns.permissions'),
            field: '_count.permissions',
            width: 120,
            cellRenderer: (params: ICellRendererParams<Role>) => (
                <Badge variant="light" color="cyan">
                    {params.value || 0} {t('table.columns.permissions')}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.usersCount'),
            field: '_count.users',
            width: 120,
            cellRenderer: (params: ICellRendererParams<Role>) => (
                <Badge variant="light" color="indigo">
                    {params.value || 0} {t('common.users')}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.createdAt'),
            field: 'createdAt',
            width: 150,
            valueFormatter: params => formatDate(params.value),
        },
        {
            headerName: t('table.columns.updatedAt'),
            field: 'updatedAt',
            width: 150,
            valueFormatter: params => formatDate(params.value),
        },
    ];
};

export const createProductColumns = (options: ColumnConfigOptions): ColDef<Product>[] => {
    const { t } = options;

    return [
        {
            headerName: t('table.columns.image'),
            field: 'images',
            width: 100,
            valueFormatter: () => '',
            filter: false,
            sortable: false,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<Product>) => {
                const imageUrl = params.value?.[0] || '';
                return (
                    <Image
                        src={imageUrl}
                        h={35}
                        w={35}
                        radius="md"
                        fallbackSrc="https://placehold.co/40x40?text=HP"
                        fit="cover"
                        alt={params.data?.name || 'Product'}
                    />
                );
            },
        },
        {
            headerName: t('table.columns.product'),
            field: 'name',
            minWidth: 200,
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Stack gap={0} py={4}>
                    <Text size="sm" fw={500} truncate="end">
                        {params.data?.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {params.data?.sku || 'No SKU'}
                    </Text>
                </Stack>
            ),
        },
        {
            headerName: t('table.columns.category'),
            valueGetter: params => params.data?.category?.name || t('common.unclassified'),
            width: 150,
        },
        {
            headerName: t('table.columns.seller'),
            width: 180,
            valueGetter: params => {
                const profile = params.data?.seller?.profile;
                if (profile) return `${profile.firstName} ${profile.lastName}`;
                return params.data?.seller?.email || 'N/A';
            },
        },
        {
            headerName: t('table.columns.price'),
            field: 'price',
            width: 160,
            cellRenderer: (params: ICellRendererParams<Product>) => {
                const price = Number(params.value);
                const originalPrice = params.data?.originalPrice ? Number(params.data.originalPrice) : 0;
                const discount = params.data?.discount;

                return (
                    <Stack gap={0} py={4}>
                        <Text size="sm" fw={700} c="red">
                            {price.toLocaleString()} ₫
                        </Text>
                        {originalPrice > price && (
                            <Group gap={4}>
                                <Text size="xs" c="dimmed" td="line-through">
                                    {originalPrice.toLocaleString()} ₫
                                </Text>
                                <Badge size="xs" color="red" variant="filled" h={14} px={2} style={{ fontSize: '8px' }}>
                                    -{discount}%
                                </Badge>
                            </Group>
                        )}
                    </Stack>
                );
            },
        },
        {
            headerName: t('table.columns.stock'),
            field: 'stock',
            width: 90,
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Text size="sm" mt={10} fw={500} c={params.value < 10 ? 'red' : 'inherit'}>
                    {params.value}
                </Text>
            ),
        },
        {
            headerName: t('table.columns.soldCount'),
            field: 'soldCount',
            width: 90,
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Text size="sm" mt={10}>
                    {params.value || 0}
                </Text>
            ),
        },
        {
            headerName: t('table.columns.rating'),
            field: 'ratingAvg',
            width: 90,
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Group gap={4} mt={10}>
                    <Text size="sm" fw={600}>{params.value || '0.0'}</Text>
                    <IconStar size={14} color="var(--mantine-color-yellow-6)" fill="var(--mantine-color-yellow-6)" />
                </Group>
            ),
        },
        {
            headerName: t('table.columns.status'),
            field: 'status',
            width: 110,
            cellRenderer: (params: ICellRendererParams<Product>) => {
                const status = params.value as ResourceStatus;
                const config = {
                    [ResourceStatus.PENDING]: { color: 'yellow', label: t('table.status.pending') },
                    [ResourceStatus.APPROVED]: { color: 'green', label: t('table.status.approved') },
                    [ResourceStatus.REJECTED]: { color: 'red', label: t('table.status.rejected') },
                    [ResourceStatus.DELETED]: { color: 'gray', label: t('table.status.deleted') },
                };
                const { color, label } = config[status] || { color: 'gray', label: status };
                return (
                    <Badge color={color} variant="light" mt={10} size="sm">
                        {label}
                    </Badge>
                );
            },
        },
        {
            headerName: t('table.columns.createdAt'),
            field: 'createdAt',
            width: 150,
            valueFormatter: params => formatDate(params.value),
        },
    ];
};

export const createActionColumn = <T extends { id: string; isActive?: boolean; status?: string }>(
    props: ActionColumnProps<T>,
    options: ColumnConfigOptions,
): ColDef<T> => {
    const { t } = options;

    return {
        headerName: t('table.columns.actions'),
        pinned: 'right',
        width: 150,
        sortable: false,
        filter: false,
        suppressHeaderMenuButton: true,
        cellRenderer: (params: ICellRendererParams<T>) => {
            if (!params.data) return null;

            const item = params.data;
            const isActive = item.isActive ?? false;
            const isLoading = props.isToggleLoading && props.toggleLoadingId === item.id;

            return (
                <Group gap="xs" mt={4}>
                    {props.onDetail && (
                        <Tooltip label={t('table.actions.view')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => props.onDetail!(item)}
                                aria-label={t('table.actions.view')}
                            >
                                <IconEye size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {props.onUpdate && (
                        <Tooltip label={t('table.actions.edit')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="orange"
                                onClick={() => props.onUpdate!(item)}
                                aria-label={t('table.actions.edit')}
                            >
                                <IconEdit size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {props.onToggleStatus && (
                        <Tooltip
                            label={isActive ? t('table.actions.lock') : t('table.actions.unlock')}
                            withArrow
                        >
                            <ActionIcon
                                variant="light"
                                color={isActive ? 'red' : 'green'}
                                loading={isLoading}
                                onClick={() => props.onToggleStatus!(item)}
                                aria-label={
                                    isActive ? t('table.actions.lock') : t('table.actions.unlock')
                                }
                            >
                                {isActive ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {props.onDelete && (
                        <Tooltip label={t('table.actions.delete')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => props.onDelete!(item)}
                                aria-label={t('table.actions.delete')}
                                disabled={
                                    'isSystem' in item && !!(item as unknown as Role).isSystem
                                }
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {props.onApprove && item.status === ResourceStatus.PENDING && (
                        <Tooltip label={t('table.actions.approve')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="green"
                                onClick={() => props.onApprove!(item)}
                                aria-label={t('table.actions.approve')}
                            >
                                <IconCheck size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {props.onReject && item.status === ResourceStatus.PENDING && (
                        <Tooltip label={t('table.actions.reject')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => props.onReject!(item)}
                                aria-label={t('table.actions.reject')}
                            >
                                <IconX size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            );
        },
    };
};

export const getActionColumn = <T extends { id: string; isActive?: boolean }>(
    props: ActionColumnProps<T>,
): ColDef<T> => ({
    headerName: 'Actions',
    pinned: 'right',
    width: 150,
    sortable: false,
    filter: false,
    cellRenderer: (params: ICellRendererParams<T>) => {
        if (!params.data) return null;
        const item = params.data;
        const isActive = item.isActive;

        return (
            <Group gap="xs" mt={4}>
                {props.onDetail && (
                    <Tooltip label="View details">
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => props.onDetail!(item)}
                        >
                            <IconEye size={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
                {props.onUpdate && (
                    <Tooltip label="Edit">
                        <ActionIcon
                            variant="light"
                            color="orange"
                            onClick={() => props.onUpdate!(item)}
                        >
                            <IconEdit size={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
                {props.onToggleStatus && (
                    <Tooltip label={isActive ? 'Lock' : 'Unlock'}>
                        <ActionIcon
                            variant="light"
                            color={isActive ? 'red' : 'green'}
                            loading={props.isToggleLoading && props.toggleLoadingId === item.id}
                            onClick={() => props.onToggleStatus!(item)}
                        >
                            {isActive ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        );
    },
});
