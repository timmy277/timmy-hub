import { PrismaClient } from '@prisma/client';

export const seedingRolesData = async (prisma: PrismaClient) => {
    console.log('  - Seeding roles...');

    // Create SUPER_ADMIN role
    const superAdminRole = await prisma.systemRole.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: {
            name: 'SUPER_ADMIN',
            displayName: 'Quản trị tối cao',
            description: 'Toàn quyền hệ thống',
            isSystem: true,
        },
    });

    // Assign all permissions to SUPER_ADMIN
    const allPermissions = await prisma.permission.findMany();
    for (const p of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: p.id,
                },
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                permissionId: p.id,
            },
        });
    }
};
