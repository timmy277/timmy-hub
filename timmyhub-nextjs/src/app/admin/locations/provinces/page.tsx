import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProvinceList from '@/features/admin/locations/ProvinceList';
import { QUERY_KEYS } from '@/constants';

export const metadata = {
    title: 'Quản lý Tỉnh/Thành phố | TimmyHub Admin',
    description: 'Quản lý danh sách tỉnh/thành phố',
};

export default async function AdminProvincesPage() {
    const queryClient = new QueryClient();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.ADMIN_PROVINCES,
        queryFn: async () => {
            const apiUrl =
                process.env.API_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                'http://localhost:3001/api';

            const res = await fetch(`${apiUrl}/locations/provinces/admin`, {
                headers: { Cookie: `access_token=${accessToken}` },
                cache: 'no-store',
            });

            if (res.status === 401 || res.status === 403) {
                redirect('/login');
            }

            if (!res.ok) throw new Error('Failed to fetch provinces');
            return res.json();
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProvinceList />
        </HydrationBoundary>
    );
}
