import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { parseArgs } from 'node:util';

// Import seed functions
import { seedingPermissionsData } from './seeds/permission';
import { seedingRolesData } from './seeds/role';
import { seedingUsersData } from './seeds/user';
import { seedingSellerProfilesData } from './seeds/seller';
import { seedingCategoriesData } from './seeds/category';
import { seedingProductsData } from './seeds/product';
import { seedingLocationsData } from './seeds/location';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
    const {
        values: { environment },
    } = parseArgs({
        options: {
            environment: { type: 'string' },
        },
        allowPositionals: true,
    });

    console.log(`\n🌱 Starting seeding for ${environment || 'default'} environment...\n`);

    // Flow chung cho mọi môi trường (Foundation)
    // 1. Seed Permissions
    await seedingPermissionsData(prisma);

    // 2. Seed Roles
    await seedingRolesData(prisma);

    // 3. Seed Users
    await seedingUsersData(prisma);

    // 3.5. Seed Seller Profiles (after users, before products)
    await seedingSellerProfilesData(prisma);

    // 4. Seed Categories
    await seedingCategoriesData(prisma);

    // 5. Seed Products
    await seedingProductsData(prisma);

    // 6. Seed Locations (province, district, ward)
    await seedingLocationsData(prisma);

    if (environment === 'development') {
        // Thêm các dữ liệu dev khác ở đây (Sản phẩm mẫu, Order mẫu...)
        console.log('  - Seeding additional development data...');
    }

    // Ngắt kết nối
    await prisma.$disconnect();
    await pool.end();

    console.log('\n🎉 Seeding completed!\n');
}

seed().catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
