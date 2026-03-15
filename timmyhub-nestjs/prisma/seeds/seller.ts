import { PrismaClient, ResourceStatus } from '@prisma/client';

/**
 * Seed Seller Profiles for existing SELLER users
 * This creates approved seller profiles so they can start selling immediately
 */
export const seedingSellerProfilesData = async (prisma: PrismaClient) => {
    console.log('  - Seeding seller profiles...');

    // Lấy users có role SELLER (bao gồm profile)
    const sellerUsers = await prisma.user.findMany({
        where: { roles: { has: 'SELLER' } },
        include: { profile: true },
    });

    if (sellerUsers.length === 0) {
        console.warn('    ⚠️ No seller users found. Skipping seller profile seeding.');
        return;
    }

    const sellerProfiles = [
        {
            shopName: 'Việt Dũng Store',
            shopSlug: 'viet-dung-store',
            description: 'Cửa hàng điện tử và công nghệ chính hãng',
        },
        {
            shopName: 'Mai Hoa Fashion',
            shopSlug: 'mai-hoa-fashion',
            description: 'Thời trang nữ cao cấp, phong cách hiện đại',
        },
        {
            shopName: 'Trang Đỗ Electronics',
            shopSlug: 'trang-do-electronics',
            description: 'Điện thoại, laptop và phụ kiện công nghệ',
        },
        {
            shopName: 'Minh Nguyễn Shop',
            shopSlug: 'minh-nguyen-shop',
            description: 'Shop điện tử gia đình',
        },
        {
            shopName: 'Lan Phạm Beauty',
            shopSlug: 'lan-pham-beauty',
            description: 'Mỹ phẩm và chăm sóc da',
        },
        {
            shopName: 'Hùng Trần Sport',
            shopSlug: 'hung-tran-sport',
            description: 'Thể thao và dụng cụ gym',
        },
        {
            shopName: 'Phương Lê Home',
            shopSlug: 'phuong-le-home',
            description: 'Nội thất và trang trí nhà cửa',
        },
        { shopName: 'Khoa Vũ Tech', shopSlug: 'khoa-vu-tech', description: 'Công nghệ và gaming' },
        {
            shopName: 'Thúy Ngô Fashion',
            shopSlug: 'thuy-ngo-fashion',
            description: 'Thời trang thu đông',
        },
        {
            shopName: 'Bảo Lý Accessories',
            shopSlug: 'bao-ly-accessories',
            description: 'Phụ kiện thời trang',
        },
        {
            shopName: 'Yến Trịnh Gift',
            shopSlug: 'yen-trinh-gift',
            description: 'Quà tặng và đồ lưu niệm',
        },
        {
            shopName: 'Long Đinh Pet',
            shopSlug: 'long-dinh-pet',
            description: 'Thức ăn và phụ kiện thú cưng',
        },
        { shopName: 'Hà Đặng Baby', shopSlug: 'ha-dang-baby', description: 'Đồ dùng cho bé' },
        {
            shopName: 'Nam Bùi Books',
            shopSlug: 'nam-bui-books',
            description: 'Sách và văn phòng phẩm',
        },
        {
            shopName: 'Vy Hoàng Food',
            shopSlug: 'vy-hoang-food',
            description: 'Thực phẩm và đồ ăn vặt',
        },
        { shopName: 'Tú Võ Gadget', shopSlug: 'tu-vo-gadget', description: 'Phụ kiện công nghệ' },
        {
            shopName: 'Ngọc Hồ Jewelry',
            shopSlug: 'ngoc-ho-jewelry',
            description: 'Trang sức và phụ kiện',
        },
        {
            shopName: 'Phong Lý Watch',
            shopSlug: 'phong-ly-watch',
            description: 'Đồng hồ thời trang',
        },
        {
            shopName: 'Giang Trần Art',
            shopSlug: 'giang-tran-art',
            description: 'Nghệ thuật và thủ công',
        },
        { shopName: 'Duy Lê Music', shopSlug: 'duy-le-music', description: 'Nhạc cụ và âm thanh' },
    ];

    for (let i = 0; i < sellerUsers.length; i++) {
        const user = sellerUsers[i];
        const profileData = sellerProfiles[i] || {
            shopName: user.profile?.displayName || user.email.split('@')[0],
            shopSlug: user.email.split('@')[0].replace(/[^a-z0-9]/g, '-'),
            description: 'Cửa hàng của tôi',
        };

        // Check if profile already exists
        const existingProfile = await prisma.sellerProfile.findUnique({
            where: { userId: user.id },
        });

        if (!existingProfile) {
            await prisma.sellerProfile.create({
                data: {
                    userId: user.id,
                    shopName: profileData.shopName,
                    shopSlug: profileData.shopSlug,
                    description: profileData.description,
                    status: ResourceStatus.APPROVED,
                    isVerified: true,
                    verifiedAt: new Date(),
                    rating: 4 + Math.random() * 1, // Random rating between 4-5
                },
            });
            console.log(`    ✓ Created seller profile for ${user.email}`);
        }
    }

    console.log(`    ✓ Seeded ${sellerUsers.length} seller profiles`);
};
