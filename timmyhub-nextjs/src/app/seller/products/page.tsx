import { SellerProductList } from '@/features/seller/products/SellerProductList';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

export const dynamic = 'force-dynamic';

export default async function SellerProductsPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/seller/products');
    }

    const queryClient = new QueryClient();
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Prefetch seller products for instant list render
    await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.SELLER_PRODUCTS,
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/products/seller/me`, {
                headers: { Cookie: `access_token=${accessToken}` },
                cache: 'no-store',
            });
            if (!res.ok) return { data: [] };
            return res.json();
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SellerProductList />
        </HydrationBoundary>
    );
}