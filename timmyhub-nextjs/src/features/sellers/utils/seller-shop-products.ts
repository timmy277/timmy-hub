/**
 * Lọc / sắp xếp sản phẩm trên trang gian hàng (client).
 */
import type { Product } from '@/types/product';
import type { SellerShopSortMode } from '@/constants/seller-shop-ui';

export function filterProductsByQuery(products: Product[], query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
}

export function sortProductsByMode(products: Product[], mode: SellerShopSortMode): Product[] {
    const list = [...products];
    switch (mode) {
        case 'popular':
            return list.sort((a, b) => b.soldCount - a.soldCount);
        case 'bestSelling':
            return list.sort((a, b) => b.soldCount * b.ratingAvg - a.soldCount * a.ratingAvg);
        case 'newest':
            return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'priceAsc':
            return list.sort((a, b) => a.price - b.price);
        case 'priceDesc':
            return list.sort((a, b) => b.price - a.price);
        default:
            return list;
    }
}
