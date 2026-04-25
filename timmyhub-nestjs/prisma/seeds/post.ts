import { PrismaClient, PostStatus } from '@prisma/client';

// 6 real videos uploaded to Supabase
const REAL_VIDEOS = [
    {
        videoUrl:
            'https://duxwhtfvahbpvptvkegb.supabase.co/storage/v1/object/public/timmy-hub-bucket/uploads/1777117041314-Download__6_.mp4',
        title: 'Unbox tai nghe không dây mới về - Âm thanh cực đỉnh!',
        content:
            '<p>Vừa nhận hàng xong, mở hộp ngay cho mọi người xem 🎧 Chất âm thanh <strong>cực kỳ ấn tượng</strong>, bass sâu, treble rõ ràng. Pin 30 tiếng dùng liên tục không lo hết pin giữa chừng!</p>',
        hashtags: ['unboxing', 'tainghe', 'khongday', 'review', 'congnghe'],
    },
    {
        videoUrl:
            'https://duxwhtfvahbpvptvkegb.supabase.co/storage/v1/object/public/timmy-hub-bucket/uploads/1777117098508-Download__4_.mp4',
        title: 'Setup góc làm việc tại nhà - Đẹp mà không tốn nhiều tiền',
        content:
            '<p>Chia sẻ cách mình setup góc làm việc <strong>dưới 5 triệu</strong> mà vẫn đẹp như studio 🏠 Bí quyết là chọn đúng màu sắc và ánh sáng. Xem video để biết mình đã mua gì nhé!</p>',
        hashtags: ['setup', 'workfromhome', 'noithat', 'homeofficetour', 'diy'],
    },
    {
        videoUrl:
            'https://duxwhtfvahbpvptvkegb.supabase.co/storage/v1/object/public/timmy-hub-bucket/uploads/1777117109783-Download__2_.mp4',
        title: 'Review son môi YSL - Màu đẹp lắm các chị ơi!',
        content:
            '<p>Cuối cùng cũng sắm được cây son YSL mơ ước 💄 Màu <strong>Rouge Pur Couture</strong> đẹp hơn mình tưởng nhiều, lên môi tự nhiên, lâu trôi cả ngày không cần chỉnh. Xứng đáng đầu tư!</p>',
        hashtags: ['sonmoi', 'ysl', 'lamdep', 'lipstick', 'beauty'],
    },
    {
        videoUrl:
            'https://duxwhtfvahbpvptvkegb.supabase.co/storage/v1/object/public/timmy-hub-bucket/uploads/1777117124561-Download__1_.mp4',
        title: 'Pha cà phê tại nhà ngon hơn quán - Bí quyết barista',
        content:
            '<p>Sau 3 tháng học pha cà phê, mình đã tìm ra công thức <strong>espresso hoàn hảo</strong> ☕ Tỉ lệ cà phê:nước, nhiệt độ, thời gian chiết xuất - tất cả đều quan trọng. Chia sẻ hết trong video này!</p>',
        hashtags: ['caphe', 'espresso', 'barista', 'coffeelover', 'homecafe'],
    },
    {
        videoUrl:
            'https://duxwhtfvahbpvptvkegb.supabase.co/storage/v1/object/public/timmy-hub-bucket/uploads/1777117187074-Download__5_.mp4',
        title: 'Thử váy midi mới - Mặc đi làm hay đi chơi đều được!',
        content:
            '<p>Vừa nhận váy midi mới, thử ngay cho mọi người xem 👗 Chất vải <strong>mềm mại, thoáng mát</strong>, form dáng tôn dáng cực kỳ. Mặc đi làm hay đi dự tiệc đều ổn. Size mình mặc là M, cao 1m60 nặng 50kg.</p>',
        hashtags: ['vaymidi', 'ootd', 'thoitrang', 'fashionvideo', 'outfit'],
    },
    {
        videoUrl:
            'https://duxwhtfvahbpvptvkegb.supabase.co/storage/v1/object/public/timmy-hub-bucket/uploads/1777117247223-Download__8_.mp4',
        title: 'Giày sneaker Nike Air Max 90 - Đi thử 1 tuần cảm nhận thật',
        content:
            '<p>Đã đi thử Nike Air Max 90 được 1 tuần, đây là cảm nhận thật của mình 👟 Đế êm hơn mình nghĩ, form giày đẹp, không bị chật dù mình chọn đúng size. Nhưng có 1 điểm trừ nhỏ...</p>',
        hashtags: ['nike', 'airmax', 'sneaker', 'giay', 'review1week'],
    },
];

export const seedingPostsData = async (prisma: PrismaClient) => {
    console.log('  - Seeding posts...');

    const sellers = await prisma.user.findMany({
        where: { roles: { has: 'SELLER' } },
        take: 5,
    });

    if (sellers.length === 0) {
        console.warn('    ⚠️ No sellers found. Skipping post seeding.');
        return;
    }

    const products = await prisma.product.findMany({
        where: { status: 'APPROVED' },
        take: 20,
        select: { id: true },
    });

    let count = 0;

    for (let i = 0; i < REAL_VIDEOS.length; i++) {
        const data = REAL_VIDEOS[i];
        const seller = sellers[i % sellers.length];

        const existing = await prisma.post.findFirst({ where: { title: data.title } });

        if (existing) {
            await prisma.post.update({
                where: { id: existing.id },
                data: { content: data.content, hashtags: data.hashtags, videoUrl: data.videoUrl },
            });
            console.log(`    ↺ Updated: ${data.title.slice(0, 50)}`);
        } else {
            const post = await prisma.post.create({
                data: {
                    sellerId: seller.id,
                    title: data.title,
                    content: data.content,
                    videoUrl: data.videoUrl,
                    images: [],
                    hashtags: data.hashtags,
                    status: PostStatus.PUBLISHED,
                    viewCount: Math.floor(Math.random() * 50000) + 1000,
                    likeCount: Math.floor(Math.random() * 5000) + 100,
                    commentCount: Math.floor(Math.random() * 200) + 10,
                    isPinned: i === 0,
                },
            });
            const tagProducts = products.slice(i * 2, i * 2 + 2);
            for (let j = 0; j < tagProducts.length; j++) {
                await prisma.postProduct.create({
                    data: { postId: post.id, productId: tagProducts[j].id, position: j },
                });
            }
            console.log(`    ✓ Created: ${data.title.slice(0, 50)}`);
        }
        count++;
    }

    console.log(`    ✓ Seeded ${count} posts`);
};
