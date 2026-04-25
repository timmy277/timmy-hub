import { PrismaClient, PostStatus } from '@prisma/client';

// Real videos uploaded to Supabase by seller
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

// Sample videos for additional posts
const SAMPLE_VIDEOS = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
];

const EXTRA_POSTS = [
    {
        title: 'Loa JBL Flip 6 - Nghe nhạc ngoài trời cực đã!',
        content:
            '<p>Mang loa JBL Flip 6 đi picnic cuối tuần, âm thanh <strong>vang to mà không bị vỡ tiếng</strong> 🔊 Chống nước IP67, thả xuống hồ bơi vẫn sống. Pin 12 tiếng đủ dùng cả ngày dã ngoại!</p>',
        hashtags: ['jbl', 'loa', 'bluetooth', 'outdoor', 'picnic'],
    },
    {
        title: 'Bình nước Stanley - Giữ lạnh 24h có thật không?',
        content:
            '<p>Test thực tế bình nước Stanley Adventure 1L - bỏ đá vào lúc 7h sáng, đến 7h tối hôm sau vẫn còn đá ❄️ Kết quả <strong>vượt quá kỳ vọng</strong>! Đáng đồng tiền bát gạo.</p>',
        hashtags: ['stanley', 'binhnuoc', 'giunhiet', 'test', 'review'],
    },
    {
        title: 'iPad Pro M4 - Có đáng mua không? Dùng 2 tuần nói thật',
        content:
            '<p>Sau 2 tuần dùng iPad Pro M4, đây là đánh giá thật nhất của mình 📱 Màn hình OLED <strong>đẹp không thể tả</strong>, nhưng giá cao có xứng đáng không? Xem video để biết mình có recommend không nhé!</p>',
        hashtags: ['ipad', 'apple', 'm4', 'review', 'tabletreview'],
    },
    {
        title: 'Kem chống nắng Anessa - Dùng thử 30 ngày kết quả bất ngờ',
        content:
            '<p>30 ngày dùng kem chống nắng Anessa Perfect UV SPF50+, da mình <strong>không bị sạm thêm</strong> dù đi nắng nhiều ☀️ Texture nhẹ, không nhờn, không bít lỗ chân lông. Đây là HG skincare của mình rồi!</p>',
        hashtags: ['anessa', 'kemchongnang', 'skincare', 'sunscreen', '30daytest'],
    },
    {
        title: 'Đồng hồ G-Shock mới - Đập hộp cùng mình!',
        content:
            '<p>Cuối cùng cũng tậu được chiếc G-Shock mơ ước ⌚ Kết nối Bluetooth với điện thoại, chỉnh giờ tự động, chống nước 200m. Thiết kế <strong>cực kỳ nam tính và mạnh mẽ</strong>. Xem đập hộp cùng mình nhé!</p>',
        hashtags: ['gshock', 'casio', 'donghohot', 'unboxing', 'watch'],
    },
    {
        title: 'Máy ảnh Canon R50 - Người mới bắt đầu có nên mua?',
        content:
            '<p>Mình mua Canon EOS R50 khi chưa biết gì về nhiếp ảnh, và đây là hành trình 3 tháng học chụp ảnh 📷 Máy <strong>dễ dùng hơn mình nghĩ</strong>, autofocus cực nhanh, video 4K mượt mà. Recommend cho người mới!</p>',
        hashtags: ['canon', 'r50', 'mayanh', 'photography', 'beginner'],
    },
    {
        title: 'Nước hoa Dior Sauvage - Mùi hương đáng đầu tư nhất 2026',
        content:
            '<p>Đã thử qua hơn 20 loại nước hoa, Dior Sauvage vẫn là <strong>số 1 trong lòng mình</strong> 🌊 Mùi hương tươi mát ban đầu, dần chuyển sang ấm áp và quyến rũ. Lưu hương 8-10 tiếng, xịt 2 phát là đủ cả ngày!</p>',
        hashtags: ['dior', 'sauvage', 'nuochoa', 'perfume', 'mensgrooming'],
    },
    {
        title: 'Xe đạp Giant - Đạp 500km rồi, đây là cảm nhận thật',
        content:
            '<p>Sau 6 tháng và 500km với chiếc Giant Contend AR, mình có nhiều điều muốn chia sẻ 🚴 Khung xe <strong>nhẹ và cứng</strong>, phanh đĩa ăn chắc, phù hợp cả đường phố lẫn đường trường. Nhưng yên xe cần thay sớm!</p>',
        hashtags: ['xedap', 'giant', 'cycling', 'review', 'roadbike'],
    },
];

const IMAGE_POSTS = [
    {
        images: ['https://picsum.photos/id/1/800/1200', 'https://picsum.photos/id/2/800/1200'],
        title: 'Outfit hôm nay - Tông màu trung tính cực chill',
        content:
            '<p>Hôm nay mình mix đồ theo tông <strong>neutral</strong> - be, nâu, trắng. Đơn giản nhưng vẫn có điểm nhấn nhờ chiếc túi da handmade 👜 Mọi người thấy set này thế nào?</p>',
        hashtags: ['ootd', 'outfit', 'neutral', 'fashionpost', 'style'],
    },
    {
        images: ['https://picsum.photos/id/20/800/1200'],
        title: 'Góc cà phê yêu thích - Nơi mình làm việc mỗi sáng',
        content:
            '<p>Mỗi sáng mình đều ghé quán này trước khi đi làm ☕ Không gian <strong>yên tĩnh, ánh sáng đẹp</strong>, cà phê ngon. Địa chỉ mình để trong bio nhé!</p>',
        hashtags: ['cafe', 'coffeeshop', 'morning', 'worklife', 'hanoi'],
    },
    {
        images: [
            'https://picsum.photos/id/30/800/1200',
            'https://picsum.photos/id/31/800/1200',
            'https://picsum.photos/id/32/800/1200',
        ],
        title: 'Haul mua sắm cuối tháng - Được nhiều thứ hay lắm!',
        content:
            '<p>Cuối tháng lại haul đồ 🛍️ Lần này mình mua được <strong>3 món cực ưng</strong>: áo khoác bomber, túi tote canvas và đôi sneaker trắng. Tổng chi phí hợp lý hơn mình nghĩ!</p>',
        hashtags: ['haul', 'shopping', 'thoitrang', 'muasam', 'monthlyhaul'],
    },
];

export const seedingPostsData = async (prisma: PrismaClient) => {
    console.log('  - Seeding posts...');

    const sellers = await prisma.user.findMany({
        where: { roles: { has: 'SELLER' } },
        include: { sellerProfile: true },
        take: 15,
    });

    if (sellers.length === 0) {
        console.warn('    ⚠️ No sellers found. Skipping post seeding.');
        return;
    }

    const products = await prisma.product.findMany({
        where: { status: 'APPROVED' },
        take: 40,
        select: { id: true, sellerId: true },
    });

    let created = 0;

    // Seed real video posts (assigned to first seller)
    const mainSeller = sellers[0];
    for (let i = 0; i < REAL_VIDEOS.length; i++) {
        const data = REAL_VIDEOS[i];
        const existing = await prisma.post.findFirst({
            where: { sellerId: mainSeller.id, title: data.title },
        });
        if (existing) {
            console.log(`    ⏭ Skipped: ${data.title.slice(0, 40)}`);
            continue;
        }

        const tagProducts = products.slice(i * 2, i * 2 + 2);
        const post = await prisma.post.create({
            data: {
                sellerId: mainSeller.id,
                title: data.title,
                content: data.content,
                videoUrl: data.videoUrl,
                thumbnailUrl: null,
                images: [],
                hashtags: data.hashtags,
                status: PostStatus.PUBLISHED,
                viewCount: Math.floor(Math.random() * 50000) + 1000,
                likeCount: Math.floor(Math.random() * 5000) + 100,
                commentCount: Math.floor(Math.random() * 200) + 10,
                isPinned: i === 0,
            },
        });
        for (let j = 0; j < tagProducts.length; j++) {
            await prisma.postProduct.upsert({
                where: { postId_productId: { postId: post.id, productId: tagProducts[j].id } },
                update: {},
                create: { postId: post.id, productId: tagProducts[j].id, position: j },
            });
        }
        created++;
        console.log(`    ✓ [Video] ${data.title.slice(0, 50)}`);
    }

    // Seed extra video posts with sample videos
    for (let i = 0; i < EXTRA_POSTS.length; i++) {
        const data = EXTRA_POSTS[i];
        const seller = sellers[(i + 1) % sellers.length];
        const existing = await prisma.post.findFirst({
            where: { sellerId: seller.id, title: data.title },
        });
        if (existing) {
            console.log(`    ⏭ Skipped: ${data.title.slice(0, 40)}`);
            continue;
        }

        const tagProducts = products.slice((i + 6) * 2, (i + 6) * 2 + 2);
        const post = await prisma.post.create({
            data: {
                sellerId: seller.id,
                title: data.title,
                content: data.content,
                videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
                thumbnailUrl: null,
                images: [],
                hashtags: data.hashtags,
                status: PostStatus.PUBLISHED,
                viewCount: Math.floor(Math.random() * 20000) + 500,
                likeCount: Math.floor(Math.random() * 2000) + 50,
                commentCount: Math.floor(Math.random() * 100) + 5,
                isPinned: false,
            },
        });
        for (let j = 0; j < tagProducts.length; j++) {
            await prisma.postProduct.upsert({
                where: { postId_productId: { postId: post.id, productId: tagProducts[j].id } },
                update: {},
                create: { postId: post.id, productId: tagProducts[j].id, position: j },
            });
        }
        created++;
        console.log(`    ✓ [Video] ${data.title.slice(0, 50)}`);
    }

    // Seed image posts
    for (let i = 0; i < IMAGE_POSTS.length; i++) {
        const data = IMAGE_POSTS[i];
        const seller = sellers[(i + 3) % sellers.length];
        const existing = await prisma.post.findFirst({
            where: { sellerId: seller.id, title: data.title },
        });
        if (existing) {
            console.log(`    ⏭ Skipped: ${data.title.slice(0, 40)}`);
            continue;
        }

        await prisma.post.create({
            data: {
                sellerId: seller.id,
                title: data.title,
                content: data.content,
                videoUrl: null,
                images: data.images,
                hashtags: data.hashtags,
                status: PostStatus.PUBLISHED,
                viewCount: Math.floor(Math.random() * 10000) + 200,
                likeCount: Math.floor(Math.random() * 1000) + 20,
                commentCount: Math.floor(Math.random() * 50) + 2,
                isPinned: false,
            },
        });
        created++;
        console.log(`    ✓ [Image] ${data.title.slice(0, 50)}`);
    }

    console.log(`    ✓ Seeded ${created} posts`);
};
