import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OrderList } from '@/features/admin/orders/OrderList';
import { QUERY_KEYS } from '@/constants';

export default async function Page() {
    const queryClient = new QueryClient();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.ADMIN_ORDERS,
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/orders/admin`, {
                headers: { Cookie: `access_token=${accessToken}` },
                cache: 'no-store',
            });
            if (res.status === 401 || res.status === 403) redirect('/login');
            if (!res.ok) throw new Error('Failed to fetch admin orders');
            return res.json();
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <OrderList />
        </HydrationBoundary>
    );
}
