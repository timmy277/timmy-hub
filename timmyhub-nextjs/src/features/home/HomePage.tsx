import { HomePageClient } from './HomePageClient';
import { Product } from '@/types/product';
import type { Post } from '@/types/post';
import type { Voucher } from '@/services/voucher.service';
import { HeroCarousel } from './components/HeroCarousel';

const API_URL =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api';

export default async function HomePage() {
    let products: Product[] = [];
    let vouchers: Voucher[] = [];
    let posts: Post[] = [];

    const [productsRes, vouchersRes, postsRes] = await Promise.allSettled([
        fetch(`${API_URL}/products`, {
            next: { revalidate: 300 },
        }),
        fetch(`${API_URL}/vouchers/public`, {
            next: { revalidate: 300 },
        }),
        fetch(`${API_URL}/posts/feed?limit=10`, {
            next: { revalidate: 300 },
        }),
    ]);

    // Handle products
    if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        try {
            const json = await productsRes.value.json();
            if (json.success && json.data) {
                products = json.data;
            }
        } catch {
            // Continue with empty products
        }
    }

    // Handle vouchers
    if (vouchersRes.status === 'fulfilled' && vouchersRes.value.ok) {
        try {
            const json = await vouchersRes.value.json();
            if (json.success && json.data) {
                vouchers = json.data;
            }
        } catch {
            // Continue with empty vouchers
        }
    }

    // Handle posts
    if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
        try {
            const json = await postsRes.value.json();
            if (json.success && json.data) {
                posts = json.data;
            }
        } catch {
            // Continue with empty posts
        }
    }

    return <HomePageClient initialProducts={products} initialVouchers={vouchers} initialPosts={posts} HeroCarouselComponent={HeroCarousel} />;
}
