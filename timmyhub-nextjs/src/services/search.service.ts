import axios from '@/libs/axios';

export interface SearchParams {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating';
    page?: number;
    limit?: number;
}

export interface SearchResult {
    data: SearchProduct[];
    meta: { total: number; page: number; limit: number; totalPages: number; took: number };
    aggregations: {
        categories: { key: string; doc_count: number }[];
        priceRange?: { min: number; max: number; avg: number };
    };
}

export interface SearchProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    discount: number;
    images: string[];
    categoryName: string | null;
    shopName: string | null;
    ratingAvg: number;
    ratingCount: number;
    soldCount: number;
    isFeatured: boolean;
    highlight?: { name?: string[]; description?: string[] };
}

export const searchService = {
    search: (params: SearchParams): Promise<SearchResult> =>
        axios.get('/search', { params }) as Promise<SearchResult>,

    suggest: (q: string): Promise<{ data: string[] }> =>
        axios.get('/search/suggest', { params: { q } }) as Promise<{ data: string[] }>,

    reindex: (): Promise<{ indexed: number }> =>
        axios.post('/search/reindex') as Promise<{ indexed: number }>,
};
