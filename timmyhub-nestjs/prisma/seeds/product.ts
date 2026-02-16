import { PrismaClient, ResourceStatus } from '@prisma/client';

export const seedingProductsData = async (prisma: PrismaClient) => {
    console.log('  - Seeding products...');

    // Lấy một số seller để gán sản phẩm
    const sellers = await prisma.user.findMany({
        where: { role: 'SELLER' },
        take: 3,
    });

    if (sellers.length === 0) {
        console.warn('    ⚠️ No sellers found. Skipping product seeding.');
        return;
    }

    const categories = await prisma.category.findMany();
    const catPhones = categories.find(c => c.slug === 'dien-thoai');
    const catLaptops = categories.find(c => c.slug === 'laptop');
    const catFashion = categories.find(c => c.slug === 'thoi-trang');

    const products = [
        {
            name: 'iPhone 15 Pro Max 256GB - VN/A',
            slug: 'iphone-15-pro-max-256gb',
            description:
                'iPhone 15 Pro Max là chiếc iPhone mạnh mẽ nhất từ trước đến nay với khung viền Titanium siêu bền, chip A17 Pro đột phá.',
            price: 30990000,
            originalPrice: 34990000,
            discount: 11,
            stock: 50,
            sku: 'IP15PM-256',
            images: [
                'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800',
                'https://images.unsplash.com/photo-1695048133142-1a20484d25fa?q=80&w=800',
            ],
            weight: 221,
            length: 15.9,
            width: 7.6,
            height: 0.8,
            categoryId: catPhones?.id,
            sellerId: sellers[0].id,
            status: ResourceStatus.APPROVED,
            viewCount: 1540,
            soldCount: 85,
            ratingAvg: 4.9,
            ratingCount: 42,
            isFeatured: true,
            specifications: {
                screen: '6.7 inch, Super Retina XDR OLED',
                cpu: 'Apple A17 Pro (3 nm)',
                ram: '8 GB',
                camera: 'Chính 48 MP & Phụ 12 MP, 12 MP',
                battery: '4441 mAh',
            },
            attributes: {
                brand: 'Apple',
                color: 'Titan Tự Nhiên',
                storage: '256GB',
            },
        },
        {
            name: 'Samsung Galaxy S24 Ultra 12GB/256GB',
            slug: 'samsung-galaxy-s24-ultra',
            description:
                'Galaxy AI is here. Trải nghiệm quyền năng của trí tuệ nhân tạo trên Samsung Galaxy S24 Ultra.',
            price: 26490000,
            originalPrice: 33990000,
            discount: 22,
            stock: 30,
            sku: 'S24U-256',
            images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800'],
            weight: 232,
            categoryId: catPhones?.id,
            sellerId: sellers[1].id,
            status: ResourceStatus.PENDING,
            viewCount: 850,
            soldCount: 12,
            isFeatured: true,
            specifications: {
                screen: '6.8 inch, Dynamic LTPO AMOLED 2X',
                cpu: 'Snapdragon 8 Gen 3 for Galaxy',
                ram: '12 GB',
                camera: '200 MP, f/1.7',
                battery: '5000 mAh',
            },
        },
        {
            name: 'Laptop Gaming ASUS ROG Zephyrus G14',
            slug: 'asus-rog-zephyrus-g14',
            description:
                'ROG Zephyrus G14 là chiếc laptop gaming 14 inch mạnh mẽ nhất thế giới với chip Ryzen 9 và GPU RTX 40-series.',
            price: 45990000,
            originalPrice: 49990000,
            discount: 8,
            stock: 15,
            sku: 'G14-2024',
            images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'],
            weight: 1500,
            categoryId: catLaptops?.id,
            sellerId: sellers[2].id,
            status: ResourceStatus.APPROVED,
            soldCount: 25,
            viewCount: 2100,
            ratingAvg: 4.8,
            ratingCount: 12,
            specifications: {
                cpu: 'AMD Ryzen 9 8945HS',
                gpu: 'NVIDIA GeForce RTX 4060 8GB',
                ram: '16GB LPDDR5X',
                ssd: '1TB M.2 NVMe PCIe 4.0',
            },
        },
        {
            name: 'Áo thun Polo Nam Uniqlo Supima Cotton',
            slug: 'ao-polo-nam-uniqlo-supima',
            description: 'Áo Polo với chất liệu Supima Cotton cao cấp, mềm mại và thoáng mát.',
            price: 499000,
            originalPrice: 599000,
            discount: 16,
            stock: 100,
            sku: 'UQ-POLO-S',
            images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800'],
            categoryId: catFashion?.id,
            sellerId: sellers[0].id,
            status: ResourceStatus.APPROVED,
            soldCount: 450,
            ratingAvg: 4.5,
            ratingCount: 120,
            attributes: {
                material: 'Cotton',
                style: 'Polo',
            },
        },
        {
            name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
            slug: 'sony-wh-1000xm5',
            description:
                'Tai nghe chống ồn hàng đầu thế giới với chất âm đỉnh cao và thời lượng pin ấn tượng.',
            price: 7490000,
            originalPrice: 8490000,
            discount: 12,
            stock: 20,
            sku: 'SONY-XM5',
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'],
            sellerId: sellers[1].id,
            status: ResourceStatus.APPROVED,
            soldCount: 68,
            viewCount: 3200,
            ratingAvg: 4.7,
            ratingCount: 56,
            isNew: true,
        },
    ];

    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {
                images: p.images,
                price: p.price,
                originalPrice: p.originalPrice,
            },
            create: {
                ...p,
                price: p.price,
                originalPrice: p.originalPrice,
            },
        });

        // Thêm một số variant mẫu nếu là iPhone
        if (p.slug.includes('iphone')) {
            await prisma.productVariant.deleteMany({
                where: { productId: product.id },
            });

            await prisma.productVariant.createMany({
                data: [
                    {
                        productId: product.id,
                        name: 'Titan Tự Nhiên',
                        price: p.price,
                        stock: 20,
                        sku: 'IP15PM-256-NAT',
                    },
                    {
                        productId: product.id,
                        name: 'Titan Xanh',
                        price: p.price,
                        stock: 15,
                        sku: 'IP15PM-256-BLU',
                    },
                    {
                        productId: product.id,
                        name: 'Titan Đen',
                        price: p.price,
                        stock: 15,
                        sku: 'IP15PM-256-BLK',
                    },
                ],
            });
        }
    }
};
