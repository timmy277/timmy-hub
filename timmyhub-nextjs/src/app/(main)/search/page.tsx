import { SearchPageClient } from '@/features/search/SearchPageClient';
import type { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const { q } = await searchParams;
    return { title: q ? `Tìm kiếm "${q}" - TimmyHub` : 'Tìm kiếm - TimmyHub' };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; minPrice?: string; maxPrice?: string; sortBy?: string; page?: string }> }) {
    const params = await searchParams;
    return <SearchPageClient initialParams={params} />;
}
