import { PrismaClient } from '@prisma/client';

export const seedingRolesData = async (prisma: PrismaClient) => {
    console.log('  - Seeding roles and linking permissions...');

    // 1. Tạo vai trò SUPER_ADMIN
    const superAdminRole = await prisma.systemRole.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: {
            name: 'SUPER_ADMIN',
            displayName: 'Quản trị viên tối cao',
            description: 'Có toàn quyền truy cập hệ thống',
            isSystem: true,
        },
    });

    // Gán quyền admin:all cho SUPER_ADMIN
    const adminAllPermission = await prisma.permission.findUnique({
        where: { name: 'admin:all' },
    });

    if (adminAllPermission) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdminRole.id,
                    permissionId: adminAllPermission.id,
                },
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                permissionId: adminAllPermission.id,
            },
        });
    }

    // 2. Tạo vai trò MANAGER (Chỉ có quyền duyệt sản phẩm)
    const managerRole = await prisma.systemRole.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: {
            name: 'MANAGER',
            displayName: 'Người quản lý',
            description: 'Duyệt sản phẩm và xem thông tin',
            isSystem: true,
        },
    });

    const productApprovePermission = await prisma.permission.findUnique({
        where: { name: 'product:approve' },
    });

    if (productApprovePermission) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: managerRole.id,
                    permissionId: productApprovePermission.id,
                },
            },
            update: {},
            create: {
                roleId: managerRole.id,
                permissionId: productApprovePermission.id,
            },
        });
    }

    // 3. Các vai trò cơ bản khác
    const basicRoles = [
        { name: 'ADMIN', displayName: 'Quản trị viên', description: 'Quản lý hệ thống' },
        {
            name: 'CUSTOMER',
            displayName: 'Khách hàng',
            description: 'Người mua hàng trên hệ thống',
        },
        { name: 'SELLER', displayName: 'Người bán', description: 'Người bán hàng trên hệ thống' },
        { name: 'BRAND', displayName: 'Thương hiệu', description: 'Đại diện thương hiệu' },
        { name: 'SHIPPER', displayName: 'Người giao hàng', description: 'Nhân viên giao vận' },
    ];

    for (const role of basicRoles) {
        await prisma.systemRole.upsert({
            where: { name: role.name },
            update: {},
            create: {
                name: role.name,
                displayName: role.displayName,
                description: role.description,
                isSystem: true,
            },
        });
    }
};
