/**
 * Permission Constants & Route Mapping
 * Tập trung các định nghĩa quyền và phân quyền cho route.
 * Các thông tin như Hierarchy, Groups, DisplayName được quản lý động từ Backend.
 */

// ===== PERMISSION CONSTANTS =====
// Sử dụng để check quyền trong code (AccessGuard, Buttons, v.v.)
// Đảm bảo khớp với name trong Database
export const PERMISSIONS = {
    // Quản lý hệ thống (RBAC)
    RBAC: {
        ROLES_READ: 'rbac:roles:read',
        ROLES_CREATE: 'rbac:roles:create',
        ROLES_UPDATE: 'rbac:roles:update',
        ROLES_DELETE: 'rbac:roles:delete',
        PERMISSIONS_READ: 'rbac:permissions:read',
    },
    // Người dùng
    USERS: {
        READ: 'users:read',
        CREATE: 'users:create',
        UPDATE: 'users:update',
        DELETE: 'users:delete',
        MANAGE_ROLES: 'users:manage-roles',
    },
    // Sản phẩm
    PRODUCTS: {
        READ: 'products:read',
        CREATE: 'products:create',
        UPDATE: 'products:update',
        DELETE: 'products:delete',
    },
    // Đơn hàng
    ORDERS: {
        READ: 'orders:read',
        PROCESS: 'orders:process',
        CANCEL: 'orders:cancel',
    },
    // Danh mục
    CATEGORIES: {
        READ: 'category:read',
        CREATE: 'category:create',
        UPDATE: 'category:update',
        DELETE: 'category:delete',
    },
} as const;

// ===== ROUTE-PERMISSION MAPPING =====
// Định nghĩa các route yêu cầu quyền truy cập cụ thể
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/admin': [PERMISSIONS.USERS.READ],
    
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

    // Categories
    '/admin/categories': [PERMISSIONS.CATEGORIES.READ],
};

// ===== HELPERS =====

/**
 * Lấy required permissions cho một route (hỗ trợ dynamic routes)
 */
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

/**
 * Kiểm tra user có đầy đủ permissions không
 */
export const hasPermissions = (
    userPermissions: string[],
    requiredPermissions: string[],
): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(perm => userPermissions.includes(perm));
};

/**
 * Kiểm tra user có ít nhất một trong các permissions không
 */
export const hasAnyPermission = (
    userPermissions: string[],
    requiredPermissions: string[],
): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => userPermissions.includes(perm));
};
