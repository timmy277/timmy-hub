import { PrismaClient } from '@prisma/client';

export const seedingCategoriesData = async (prisma: PrismaClient) => {
    console.log('  - Seeding categories...');

    // Fixed slugs and structure
    const categoriesData = [
        { name: 'Điện thoại', slug: 'dien-thoai' },
        { name: 'Laptop', slug: 'laptop' },
        { name: 'Thời trang', slug: 'thoi-trang' },
        { name: 'Điện gia dụng', slug: 'dien-gia-dung' },
        { name: 'Làm đẹp', slug: 'lam-dep' },
        { name: 'Sức khỏe', slug: 'suc-khoe' },
        { name: 'Đồ chơi', slug: 'do-choi' },
        { name: 'Sách', slug: 'sach' },
    ];

    for (const cat of categoriesData) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }
};
