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
};
