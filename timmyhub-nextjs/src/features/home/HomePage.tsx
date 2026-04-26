import { HomePageClient } from './HomePageClient';
import { Product } from '@/types/product';

const API_URL =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api';

export default async function HomePage() {
    let products: Product[] = [];

    try {
        const res = await fetch(`${API_URL}/products`, {
            next: { revalidate: 300 },
        });
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
                products = json.data;
            }
        }
    } catch {
        // Continue with empty products
    }

    return <HomePageClient initialProducts={products} />;
}
