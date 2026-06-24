import { SellerDashboard } from '@/features/seller';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

export const dynamic = 'force-dynamic';

export default async function SellerDashboardPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/seller');
    }

    const queryClient = new QueryClient();
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Prefetch seller data in parallel for instant dashboard load
    await Promise.all([
        // Prefetch seller profile check
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.SELLER_PROFILE_CHECK,
            queryFn: async () => {
                const res = await fetch(`${apiUrl}/seller/check`, {
                    headers: { Cookie: `access_token=${accessToken}` },
                    cache: 'no-store',
                });
                if (!res.ok) return null;
                return res.json();
            },
        }),

        // Prefetch seller orders
        queryClient.prefetchQuery({
            queryKey: ['seller-orders'],
            queryFn: async () => {
                const res = await fetch(`${apiUrl}/orders/my`, {
                    headers: { Cookie: `access_token=${accessToken}` },
                    cache: 'no-store',
                });
                if (!res.ok) return { data: [] };
                return res.json();
            },
        }),

        // Prefetch seller products
        queryClient.prefetchQuery({
            queryKey: ['seller-products-mine'],
            queryFn: async () => {
                const res = await fetch(`${apiUrl}/products/seller/me`, {
                    headers: { Cookie: `access_token=${accessToken}` },
                    cache: 'no-store',
                });
                if (!res.ok) return { data: [] };
                return res.json();
            },
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SellerDashboard />
        </HydrationBoundary>
    );
}
