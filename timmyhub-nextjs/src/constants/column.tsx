import {
    Badge,
    Group,
    ActionIcon,
    Tooltip,
    Avatar,
} from '@mantine/core';
import {
    IconEye,
    IconEdit,
    IconLock,
    IconLockOpen,
} from '@tabler/icons-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { User } from '@/types/auth';
import { UserRole } from '@/types/enums';
import { TFunction } from 'i18next';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Configuration for action column buttons
 */
export interface ActionColumnProps<T> {
    /** Callback for view/detail action */
    onDetail?: (data: T) => void;
    /** Callback for update/edit action */
    onUpdate?: (data: T) => void;
    /** Callback for toggle status action */
    onToggleStatus?: (data: T) => void;
    /** Loading state for toggle action */
    isToggleLoading?: boolean;
    /** ID of the item currently being toggled */
    toggleLoadingId?: string | null;
}

/**
 * Configuration options for column definitions
 */
export interface ColumnConfigOptions {
    /** i18next translation function */
    t: TFunction;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get role color based on role type
 * Centralized mapping for consistent UI across the application
 */
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

const formatDate = (date: string | Date | null | undefined, fallback = '01/01/2024'): string => {
    if (!date) return fallback;
    try {
        return new Date(date).toLocaleDateString();
    } catch {
        return fallback;
    }
};

// ============================================================================
// Column Definition Factories
// ============================================================================


export const createUserColumns = (options: ColumnConfigOptions): ColDef<User>[] => {
    const { t } = options;

    return [
        {
            headerName: t('table.columns.avatar'),
            field: 'profile.avatar',
            width: 100,
            cellStyle: { display: 'flex', alignItems: 'center' },
            cellRenderer: (params: ICellRendererParams<User>) => {
                const avatar = params.data?.profile?.avatar || '';
                const initial = params.data?.profile?.firstName?.charAt(0) 
                    || params.data?.email.charAt(0).toUpperCase();
                
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
            valueGetter: (params) => {
                const profile = params.data?.profile;
                if (!profile) return t('table.columns.notUpdated');
                return `${profile.firstName} ${profile.lastName}`.trim();
            },
        },
        {
            headerName: t('table.columns.email'),
            field: 'email',
            minWidth: 200,
        },
        {
            headerName: t('table.columns.role'),
            field: 'role',
            width: 150,
            cellRenderer: (params: ICellRendererParams<User>) => {
                const role = params.value as UserRole;
                return (
                    <Badge
                        color={getRoleColor(role)}
                        variant="light"
                        mt={10}
                    >
                        {t(`roles.${role}`)}
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
                    <Badge
                        color={isActive ? 'green' : 'red'}
                        variant="dot"
                        mt={10}
                    >
                        {isActive 
                            ? t('table.status.active') 
                            : t('table.status.inactive')
                        }
                    </Badge>
                );
            },
        },
        {
            headerName: t('table.columns.memberSince'),
            field: 'createdAt',
            width: 150,
            valueFormatter: (params) => formatDate(params.value),
        },
    ];
};

export const createActionColumn = <T extends { id: string; isActive?: boolean }>(
    props: ActionColumnProps<T>,
    options: ColumnConfigOptions
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
                                aria-label={isActive ? t('table.actions.lock') : t('table.actions.unlock')}
                            >
                                {isActive ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            );
        },
    };
};

// ============================================================================
// Legacy Exports (Deprecated - for backward compatibility)
// ============================================================================

export const getActionColumn = <T extends { id: string; isActive?: boolean }>(
    props: ActionColumnProps<T>
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
                        <ActionIcon variant="light" color="blue" onClick={() => props.onDetail!(item)}>
                            <IconEye size={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
                {props.onUpdate && (
                    <Tooltip label="Edit">
                        <ActionIcon variant="light" color="orange" onClick={() => props.onUpdate!(item)}>
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
    }
});
