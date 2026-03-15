import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export const seedingUsersData = async (prisma: PrismaClient) => {
    console.log('  - Seeding users...');

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    // 1. Tạo Super Admin
    const adminEmail = 'admin@timmyhub.com';
    const superAdmin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: hashedPassword,
            roles: [UserRole.SUPER_ADMIN],
            isEmailVerified: true,
            isActive: true,
            profile: {
                create: {
                    firstName: 'System',
                    lastName: 'Admin',
                    displayName: 'Timmy Admin',
                },
            },
        },
    });

    // Link Super Admin to System Role
    const superAdminRole = await prisma.systemRole.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (superAdminRole) {
        await prisma.userSystemRole.upsert({
            where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
            update: {},
            create: { userId: superAdmin.id, roleId: superAdminRole.id },
        });
    }

    // 2. Create 10 Additional Random Users
    console.log('  - Seeding 10 additional users...');
    const usersToSeed = [
        {
            email: 'customer1@example.com',
            role: UserRole.CUSTOMER,
            firstName: 'Bình',
            lastName: 'An',
            displayName: 'An Bình',
        },
        {
            email: 'customer2@example.com',
            role: UserRole.CUSTOMER,
            firstName: 'Cường',
            lastName: 'Quốc',
            displayName: 'Quốc Cường',
        },
        {
            email: 'seller1@example.com',
            role: UserRole.SELLER,
            firstName: 'Dũng',
            lastName: 'Việt',
            displayName: 'Việt Dũng Store',
        },
        {
            email: 'seller2@example.com',
            role: UserRole.SELLER,
            firstName: 'Hoa',
            lastName: 'Mai',
            displayName: 'Mai Hoa Fashion',
        },
        {
            email: 'shipper1@example.com',
            role: UserRole.SHIPPER,
            firstName: 'Tuấn',
            lastName: 'Anh',
            displayName: 'Tuấn Anh Express',
        },
        {
            email: 'shipper2@example.com',
            role: UserRole.SHIPPER,
            firstName: 'Minh',
            lastName: 'Trần',
            displayName: 'Minh Trần Delivery',
        },
        {
            email: 'brand1@example.com',
            role: UserRole.BRAND,
            firstName: 'Thảo',
            lastName: 'Lê',
            displayName: 'Lê Thảo Brand',
        },
        {
            email: 'admin2@example.com',
            role: UserRole.ADMIN,
            firstName: 'Linh',
            lastName: 'Nguyễn',
            displayName: 'Linh Nguyễn Admin',
        },
        {
            email: 'customer3@example.com',
            role: UserRole.CUSTOMER,
            firstName: 'Hùng',
            lastName: 'Phạm',
            displayName: 'Hùng Phạm',
        },
        {
            email: 'seller3@example.com',
            role: UserRole.SELLER,
            firstName: 'Trang',
            lastName: 'Đỗ',
            displayName: 'Trang Đỗ Electronics',
        },
        // Thêm 20 seller users mới
        {
            email: 'seller4@example.com',
            role: UserRole.SELLER,
            firstName: 'Minh',
            lastName: 'Nguyễn',
            displayName: 'Minh Nguyễn Shop',
        },
        {
            email: 'seller5@example.com',
            role: UserRole.SELLER,
            firstName: 'Lan',
            lastName: 'Phạm',
            displayName: 'Lan Phạm Beauty',
        },
        {
            email: 'seller6@example.com',
            role: UserRole.SELLER,
            firstName: 'Hùng',
            lastName: 'Trần',
            displayName: 'Hùng Trần Sport',
        },
        {
            email: 'seller7@example.com',
            role: UserRole.SELLER,
            firstName: 'Phương',
            lastName: 'Lê',
            displayName: 'Phương Lê Home',
        },
        {
            email: 'seller8@example.com',
            role: UserRole.SELLER,
            firstName: 'Khoa',
            lastName: 'Vũ',
            displayName: 'Khoa Vũ Tech',
        },
        {
            email: 'seller9@example.com',
            role: UserRole.SELLER,
            firstName: 'Thúy',
            lastName: 'Ngô',
            displayName: 'Thúy Ngô Fashion',
        },
        {
            email: 'seller10@example.com',
            role: UserRole.SELLER,
            firstName: 'Bảo',
            lastName: 'Lý',
            displayName: 'Bảo Lý Accessories',
        },
        {
            email: 'seller11@example.com',
            role: UserRole.SELLER,
            firstName: 'Yến',
            lastName: 'Trịnh',
            displayName: 'Yến Trịnh Gift',
        },
        {
            email: 'seller12@example.com',
            role: UserRole.SELLER,
            firstName: 'Long',
            lastName: 'Đinh',
            displayName: 'Long Đinh Pet',
        },
        {
            email: 'seller13@example.com',
            role: UserRole.SELLER,
            firstName: 'Hà',
            lastName: 'Đặng',
            displayName: 'Hà Đặng Baby',
        },
        {
            email: 'seller14@example.com',
            role: UserRole.SELLER,
            firstName: 'Nam',
            lastName: 'Bùi',
            displayName: 'Nam Bùi Books',
        },
        {
            email: 'seller15@example.com',
            role: UserRole.SELLER,
            firstName: 'Vy',
            lastName: 'Hoàng',
            displayName: 'Vy Hoàng Food',
        },
        {
            email: 'seller16@example.com',
            role: UserRole.SELLER,
            firstName: 'Tú',
            lastName: 'Võ',
            displayName: 'Tú Võ Gadget',
        },
        {
            email: 'seller17@example.com',
            role: UserRole.SELLER,
            firstName: 'Ngọc',
            lastName: 'Hồ',
            displayName: 'Ngọc Hồ Jewelry',
        },
        {
            email: 'seller18@example.com',
            role: UserRole.SELLER,
            firstName: 'Phong',
            lastName: 'Lý',
            displayName: 'Phong Lý Watch',
        },
        {
            email: 'seller19@example.com',
            role: UserRole.SELLER,
            firstName: 'Giang',
            lastName: 'Trần',
            displayName: 'Giang Trần Art',
        },
        {
            email: 'seller20@example.com',
            role: UserRole.SELLER,
            firstName: 'Duy',
            lastName: 'Lê',
            displayName: 'Duy Lê Music',
        },
    ];

    for (const u of usersToSeed) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                passwordHash: hashedPassword,
                roles: [u.role],
                isEmailVerified: true,
                isActive: true,
                profile: {
                    create: {
                        firstName: u.firstName,
                        lastName: u.lastName,
                        displayName: u.displayName,
                    },
                },
            },
        });
    }
};
