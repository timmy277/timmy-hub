import { PrismaClient } from '@prisma/client';

export const seedingPermissionsData = async (prisma: PrismaClient) => {
    console.log('  - Seeding permissions...');
    const permissionsData = [
        { name: 'dashboard.view', displayName: 'Xem Dashboard', module: 'dashboard', action: 'view' },
        { name: 'user.view', displayName: 'Xem người dùng', module: 'user', action: 'view' },
        { name: 'user.manage', displayName: 'Quản lý người dùng', module: 'user', action: 'manage' },
        { name: 'role.manage', displayName: 'Quản lý vai trò', module: 'rbac', action: 'manage' },
    ];

    for (const p of permissionsData) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        });
    }
};
