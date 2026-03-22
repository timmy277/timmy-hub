import { Badge, Group, ActionIcon, Tooltip, Avatar, Stack, Text, Image, Flex } from '@mantine/core';
import NextImage from 'next/image';
import Iconify from '@/components/iconify/Iconify';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { User } from '@/types/auth';
import { Role, Permission } from '@/types/rbac';
import { Product, ResourceStatus } from '@/types/product';
import { Category } from '@/types/category';
import type { Order, OrderStatus } from '@/types/order';
import { UserRole } from '@/types/enums';
import { TFunction } from 'i18next';
import { formatDate } from '@/utils/date';
import { formatVND } from '@/utils/currency';
import dayjs from 'dayjs';
import type { SystemLog as SystemLogType } from '@/services/system-logs.service';

export interface ActionColumnProps<T> {
    onDetail?: (data: T) => void;
    onUpdate?: (data: T) => void;
    onToggleStatus?: (data: T) => void;
    onDelete?: (data: T) => void;
    onApprove?: (data: T) => void;
    onReject?: (data: T) => void;
    onMessage?: (data: T) => void;
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
            field: 'roles',
            minWidth: 180,
            cellRenderer: (params: ICellRendererParams<User>) => {
                // Ưu tiên roles[] (multi-role), fallback về role singular (legacy)
                const roles: UserRole[] = params.data?.roles?.length
                    ? (params.data.roles as UserRole[])
                    : params.data?.role
                        ? [params.data.role as UserRole]
                        : [];

                if (roles.length === 0) {
                    return (
                        <Badge color="gray" variant="light" mt={10}>
                            -
                        </Badge>
                    );
                }

                return (
                    <Group gap={4} mt={6} wrap="wrap">
                        {roles.map(role => {
                            const translated = t(`roles.${role}`);
                            const displayRole = translated === `roles.${role}` ? role : translated;
                            return (
                                <Badge key={role} color={getRoleColor(role)} variant="light" size="sm">
                                    {displayRole}
                                </Badge>
                            );
                        })}
                    </Group>
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
                        component={NextImage}
                        src={imageUrl}
                        height={35}
                        width={35}
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
                            {formatVND(price)}
                        </Text>
                        {originalPrice > price && (
                            <Group gap={4}>
                                <Text size="xs" c="dimmed" td="line-through">
                                    {formatVND(originalPrice)}
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
                    <Iconify icon="tabler:star" width={14} color="var(--mantine-color-yellow-6)" style={{ fill: 'var(--mantine-color-yellow-6)' }} />
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

export const createSellerProductColumns = (options: ColumnConfigOptions): ColDef<Product>[] => {
    const { t } = options;

    return [
        {
            headerName: t('table.columns.image'),
            field: 'images',
            width: 80,
            filter: false,
            sortable: false,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Image
                    component={NextImage}
                    src={params.value?.[0] || ''}
                    height={35}
                    width={35}
                    radius="md"
                    fallbackSrc="https://placehold.co/40x40?text=SP"
                    fit="cover"
                    alt={params.data?.name || 'Product'}
                />
            ),
        },
        {
            headerName: t('table.columns.product'),
            field: 'name',
            minWidth: 220,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Stack gap={0} py={4}>
                    <Text size="sm" fw={500} truncate="end">{params.data?.name}</Text>
                    <Text size="xs" c="dimmed">{params.data?.sku || 'No SKU'}</Text>
                </Stack>
            ),
        },
        {
            headerName: t('table.columns.price'),
            field: 'price',
            width: 140,
            cellRenderer: (params: ICellRendererParams<Product>) => (
                <Text size="sm" fw={700} c="red" mt={10}>
                    {formatVND(Number(params.value))}
                </Text>
            ),
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
                <Text size="sm" mt={10}>{params.value || 0}</Text>
            ),
        },
        {
            headerName: t('table.columns.status'),
            field: 'status',
            width: 120,
            cellRenderer: (params: ICellRendererParams<Product>) => {
                const status = params.value as ResourceStatus;
                const config: Record<ResourceStatus, { color: string; label: string }> = {
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
            width: 140,
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
                                <Iconify icon="tabler:eye" width={16} />
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
                                <Iconify icon="tabler:edit" width={16} />
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
                                {isActive ? <Iconify icon="tabler:lock" width={16} /> : <Iconify icon="tabler:lock-open" width={16} />}
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
                                <Iconify icon="tabler:trash" width={16} />
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
                                <Iconify icon="tabler:check" width={16} />
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
                                <Iconify icon="tabler:x" width={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}

                    {props.onMessage && (
                        <Tooltip label={t('table.actions.message') || 'Nhắn tin'} withArrow>
                            <ActionIcon
                                variant="light"
                                color="cyan"
                                onClick={() => props.onMessage!(item)}
                                aria-label={t('table.actions.message') || 'Nhắn tin'}
                            >
                                <Iconify icon="tabler:message" width={16} />
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
                            <Iconify icon="tabler:eye" width={16} />
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
                            <Iconify icon="tabler:edit" width={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
                {props.onDelete && (
                    <Tooltip label="Delete">
                        <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => props.onDelete!(item)}
                        >
                            <Iconify icon="tabler:trash" width={16} />
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
                            {isActive ? <Iconify icon="tabler:lock" width={16} /> : <Iconify icon="tabler:lock-open" width={16} />}
                        </ActionIcon>
                    </Tooltip>
                )}
                {props.onMessage && (
                    <Tooltip label="Nhắn tin">
                        <ActionIcon
                            variant="light"
                            color="cyan"
                            onClick={() => props.onMessage!(item)}
                        >
                            <Iconify icon="tabler:message" width={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        );
    },
});

export const createCategoryColumns = ({ t }: ColumnConfigOptions): ColDef<Category>[] => {
    return [
        {
            headerName: t('table.columns.image'),
            field: 'image',
            width: 100,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<Category>) => (
                <Avatar src={params.value} size="sm" radius="md" />
            ),
        },
        {
            headerName: t('table.columns.name'),
            field: 'name',
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<Category>) => (
                <Stack gap={0}>
                    <Text size="sm" fw={500}>
                        {params.value}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {params.data?.slug}
                    </Text>
                </Stack>
            ),
        },
        {
            headerName: t('table.columns.status'),
            field: 'isActive',
            width: 120,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<Category>) => (
                <Badge color={params.value ? 'green' : 'gray'} variant="light">
                    {params.value ? t('table.status.active') : t('table.status.inactive')}
                </Badge>
            ),
        },
        {
            headerName: t('table.columns.createdAt'),
            field: 'createdAt',
            width: 150,
            valueFormatter: params => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString('vi-VN');
            },
        },
    ];
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    PACKED: 'Đã đóng gói',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    RETURN_REQUESTED: 'Yêu cầu trả hàng',
    RETURNED: 'Đã trả hàng',
    REFUNDED: 'Đã hoàn tiền',
};

export const createOrderColumns = (options: ColumnConfigOptions): ColDef<Order>[] => {
    const { t } = options;
    return [
        {
            headerName: 'Mã đơn',
            field: 'id',
            width: 120,
            valueGetter: params => (params.data?.id ? `#${params.data.id.slice(-8)}` : ''),
        },
        {
            headerName: 'Khách hàng',
            field: 'user',
            minWidth: 200,
            valueGetter: params => {
                const user = params.data?.user;
                if (!user) return '-';
                const p = user.profile;
                const name = (p?.displayName ?? [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim()) || '';
                return name ? `${name} (${user.email ?? ''})` : (user.email ?? '-');
            },
        },
        {
            headerName: 'Trạng thái',
            field: 'status',
            width: 140,
            cellRenderer: (params: ICellRendererParams<Order>) => {
                const status = params.value as OrderStatus;
                const color =
                    status === 'COMPLETED' || status === 'DELIVERED'
                        ? 'green'
                        : status === 'CANCELLED' || status === 'REFUNDED'
                            ? 'red'
                            : status === 'PENDING'
                                ? 'gray'
                                : 'blue';
                return (
                    <Badge size="sm" variant="light" color={color}>
                        {ORDER_STATUS_LABELS[status] ?? status}
                    </Badge>
                );
            },
        },
        {
            headerName: 'Thanh toán',
            field: 'paymentStatus',
            width: 120,
        },
        {
            headerName: 'Tổng tiền',
            field: 'totalAmount',
            width: 130,
            valueFormatter: params =>
                params.value != null ? formatVND(Number(params.value)) : '',
        },
        {
            headerName: t('table.columns.createdAt'),
            field: 'createdAt',
            width: 150,
            valueFormatter: params => (params.value ? formatDate(params.value) : ''),
        },
    ];
};

// ===== System Log Columns =====

export const createSystemLogColumns = (
    handleDetail: (log: SystemLogType) => void,
): ColDef<SystemLogType>[] => [
        {
            field: 'createdAt',
            headerName: 'Thời gian',
            width: 170,
            valueFormatter: params =>
                params.value ? dayjs(params.value as string).format('DD/MM/YYYY HH:mm:ss') : '',
        },
        {
            field: 'user',
            headerName: 'Người thực hiện',
            width: 250,
            cellRenderer: (params: ICellRendererParams<SystemLogType>) => {
                const user = params.data?.user;
                if (!user) {
                    return (
                        <Text size="sm" c="dimmed">
                            Hệ thống
                        </Text>
                    );
                }

                return (
                    <Flex direction="column">
                        <Text size="sm" fw={500}>
                            {user.profile?.lastName} {user.profile?.firstName}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {user.email}
                        </Text>
                    </Flex>
                );
            },
        },
        { field: 'action', headerName: 'Hành động', width: 220 },
        { field: 'entityType', headerName: 'Loại Data', width: 140 },
        { field: 'entityId', headerName: 'Data ID', width: 200 },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 140,
            cellRenderer: (params: ICellRendererParams<SystemLogType>) => (
                <Badge color={params.value === 'SUCCESS' ? 'green' : 'red'}>
                    {params.value as string}
                </Badge>
            ),
        },
        { field: 'ipAddress', headerName: 'IP', width: 150 },
        {
            field: 'metadata',
            headerName: 'Chi tiết (Metadata)',
            width: 180,
            cellRenderer: (params: ICellRendererParams<SystemLogType>) => {
                const value = params.value as Record<string, unknown> | undefined;
                if (!value || Object.keys(value).length === 0) return '-';

                return (
                    <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={e => {
                            e.stopPropagation();
                            if (params.data) {
                                handleDetail(params.data);
                            }
                        }}
                        aria-label="Xem chi tiết metadata"
                    >
                        <Iconify icon="tabler:info-circle" width="1rem" />
                    </ActionIcon>
                );
            },
        },
    ];


