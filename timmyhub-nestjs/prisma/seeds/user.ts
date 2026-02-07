import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export const seedingUsersData = async (prisma: PrismaClient) => {
    console.log('  - Seeding users...');

    const adminEmail = 'admin@timmyhub.com';
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: hashedPassword,
            role: UserRole.SUPER_ADMIN,
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
    // 2. Create 10 Additional Random Users
    console.log('  - Seeding 10 additional users...');
    const usersToSeed = [
        { email: 'customer1@example.com', role: UserRole.CUSTOMER, firstName: 'Bình', lastName: 'An', displayName: 'An Bình' },
        { email: 'customer2@example.com', role: UserRole.CUSTOMER, firstName: 'Cường', lastName: 'Quốc', displayName: 'Quốc Cường' },
        { email: 'seller1@example.com', role: UserRole.SELLER, firstName: 'Dũng', lastName: 'Việt', displayName: 'Việt Dũng Store' },
        { email: 'seller2@example.com', role: UserRole.SELLER, firstName: 'Hoa', lastName: 'Mai', displayName: 'Mai Hoa Fashion' },
        { email: 'shipper1@example.com', role: UserRole.SHIPPER, firstName: 'Tuấn', lastName: 'Anh', displayName: 'Tuấn Anh Express' },
        { email: 'shipper2@example.com', role: UserRole.SHIPPER, firstName: 'Minh', lastName: 'Trần', displayName: 'Minh Trần Delivery' },
        { email: 'brand1@example.com', role: UserRole.BRAND, firstName: 'Thảo', lastName: 'Lê', displayName: 'Lê Thảo Brand' },
        { email: 'admin2@example.com', role: UserRole.ADMIN, firstName: 'Linh', lastName: 'Nguyễn', displayName: 'Linh Nguyễn Admin' },
        { email: 'customer3@example.com', role: UserRole.CUSTOMER, firstName: 'Hùng', lastName: 'Phạm', displayName: 'Hùng Phạm' },
        { email: 'seller3@example.com', role: UserRole.SELLER, firstName: 'Trang', lastName: 'Đỗ', displayName: 'Trang Đỗ Electronics' },
    ];

    for (const u of usersToSeed) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                passwordHash: hashedPassword, // Dùng chung pass Admin@123 để dễ test
                role: u.role,
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

