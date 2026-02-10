export interface Permission {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    module: string;
    action: string;
    createdAt: string;
}

export interface RolePermission {
    id: string;
    roleId: string;
    permissionId: string;
    permission: Permission;
}

export interface Role {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
    permissions?: RolePermission[];
    _count?: {
        permissions: number;
        users: number;
    };
}

export interface CreateRoleInput {
    name: string;
    displayName: string;
    description?: string;
    isSystem?: boolean;
    permissionNames?: string[];
}

export interface CreatePermissionInput {
    name: string;
    displayName: string;
    description?: string;
    module: string;
    action: string;
}

export interface UpdatePermissionInput {
    displayName?: string;
    description?: string;
    module?: string;
    action?: string;
}
