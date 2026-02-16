import { PrismaClient } from '@prisma/client';

export const seedingCategoriesData = async (prisma: PrismaClient) => {
    console.log('  - Seeding categories...');

    const categoriesData = [
        {
            name: 'Điện thoại',
            slug: 'dien-thoai',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Laptop',
            slug: 'laptop',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Thời trang',
            slug: 'thoi-trang',
            image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Điện gia dụng',
            slug: 'dien-gia-dung',
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Làm đẹp',
            slug: 'lam-dep',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Sức khỏe',
            slug: 'suc-khoe',
            image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Đồ chơi',
            slug: 'do-choi',
            image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Sách',
            slug: 'sach',
            image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Đồng hồ',
            slug: 'dong-ho',
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Giày dép',
            slug: 'giay-dep',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Máy ảnh',
            slug: 'may-anh',
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Túi xách',
            slug: 'tui-xach',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Trang sức',
            slug: 'trang-suc',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Nội thất',
            slug: 'noi-that',
            image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Thể thao',
            slug: 'the-thao',
            image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Du lịch',
            slug: 'du-lich',
            image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Thực phẩm',
            slug: 'thuc-pham',
            image: 'https://images.unsplash.com/photo-1506484334402-40ff22e05a6d?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Mẹ và Bé',
            slug: 'me-va-be',
            image: 'https://images.unsplash.com/photo-1544126592-807daf21565c?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Nhà cửa',
            slug: 'nha-cua',
            image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=200&h=200&auto=format&fit=crop',
        },
        {
            name: 'Phụ kiện',
            slug: 'phu-kien',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&h=200&auto=format&fit=crop',
        },
    ];

    for (const cat of categoriesData) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { image: cat.image },
            create: cat,
        });
    }
};
