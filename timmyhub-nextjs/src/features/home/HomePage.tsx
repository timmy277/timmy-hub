import { productService } from '@/services/product.service';
import { HomePageClient } from './HomePageClient';
import { Product } from '@/types/product';

/**
 * Server Component - HomePage chính
 * Fetches approved products từ API và truyền xuống client component
 */
export default async function HomePage() {
    // Fetch approved products từ server
    let products: Product[] = [];

    try {
        const response = await productService.getProducts();
        if (response.success && response.data) {
            products = response.data;
        }
    } catch (error) {
        console.error('Failed to fetch products:', error);
        // Continue with empty products array
    }

    return <HomePageClient initialProducts={products} />;
}
