
export const PERMISSIONS = {
    RBAC: {
        ROLES_READ: 'rbac:roles:read',
        ROLES_CREATE: 'rbac:roles:create',
        ROLES_UPDATE: 'rbac:roles:update',
        ROLES_DELETE: 'rbac:roles:delete',
        PERMISSIONS_READ: 'rbac:permissions:read',
    },
    USERS: {
        READ: 'users:read',
        CREATE: 'users:create',
        UPDATE: 'users:update',
        DELETE: 'users:delete',
        MANAGE_ROLES: 'users:manage-roles',
    },
    PRODUCTS: {
        READ: 'products:read',
        CREATE: 'products:create',
        UPDATE: 'products:update',
        DELETE: 'products:delete',
    },
    ORDERS: {
        READ: 'orders:read',
        PROCESS: 'orders:process',
        CANCEL: 'orders:cancel',
    },
    SELLER: {
        PRODUCTS_READ: 'seller:products:read',
        PRODUCTS_WRITE: 'seller:products:write',
        ORDERS_READ: 'seller:orders:read',
        VOUCHERS_WRITE: 'seller:vouchers:write',
        CAMPAIGNS_WRITE: 'seller:campaigns:write',
        ANALYTICS_READ: 'seller:analytics:read',
    },
} as const;

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/admin': [],
    '/admin/dashboard': [],

    // Users
    '/admin/users': [PERMISSIONS.USERS.READ],
    '/admin/users/create': [PERMISSIONS.USERS.CREATE],
    '/admin/users/[id]/edit': [PERMISSIONS.USERS.UPDATE],

    // Roles
    '/admin/roles': [PERMISSIONS.RBAC.ROLES_READ],
    '/admin/roles/create': [PERMISSIONS.RBAC.ROLES_CREATE],
    '/admin/roles/[id]/edit': [PERMISSIONS.RBAC.ROLES_UPDATE],

    // Permissions
    '/admin/permissions': [PERMISSIONS.RBAC.PERMISSIONS_READ],

    // Products
    '/admin/products': [PERMISSIONS.PRODUCTS.READ],
    '/admin/products/create': [PERMISSIONS.PRODUCTS.CREATE],
    '/admin/products/[id]/edit': [PERMISSIONS.PRODUCTS.UPDATE],

    // Orders
    '/admin/orders': [PERMISSIONS.ORDERS.READ],
    '/admin/orders/[id]': [PERMISSIONS.ORDERS.READ],
};

export const getRoutePermissions = (pathname: string): string[] => {
    if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];

    for (const [pattern, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pattern.includes('[')) {
            const regex = new RegExp(`^${pattern.replace(/\[.*?\]/g, '[^/]+')}$`);
            if (regex.test(pathname)) return permissions;
        }
    }
    return [];
};

export const hasPermissions = (
    userPermissions: string[],
    requiredPermissions: string[],
): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(perm => userPermissions.includes(perm));
};

export const hasAnyPermission = (
    userPermissions: string[],
    requiredPermissions: string[],
): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => userPermissions.includes(perm));
};
