import { PrismaClient } from '@prisma/client';

export const seedingPermissionsData = async (prisma: PrismaClient) => {
    console.log('  - Seeding permissions...');

    const permissions = [
        // RBAC Permissions
        { name: 'rbac:roles:read', displayName: 'Xem danh sách vai trò', module: 'RBAC', action: 'READ' },
        { name: 'rbac:roles:create', displayName: 'Tạo vai trò mới', module: 'RBAC', action: 'CREATE' },
        { name: 'rbac:roles:update', displayName: 'Sửa vai trò', module: 'RBAC', action: 'UPDATE' },
        { name: 'rbac:roles:delete', displayName: 'Xóa vai trò', module: 'RBAC', action: 'DELETE' },
        { name: 'rbac:permissions:read', displayName: 'Xem danh sách quyền', module: 'RBAC', action: 'READ' },

        // User Permissions
        { name: 'users:read', displayName: 'Xem danh sách người dùng', module: 'USERS', action: 'READ' },
        { name: 'users:update', displayName: 'Cập nhật người dùng', module: 'USERS', action: 'UPDATE' },

        // Product Permissions (Approval Flow)
        { name: 'product:approve', displayName: 'Duyệt hoặc từ chối sản phẩm', module: 'PRODUCT', action: 'APPROVE' },

        // Admin All
        { name: 'admin:all', displayName: 'Toàn quyền hệ thống', module: 'ADMIN', action: 'ALL' },
    ];

    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        });
    }
};
