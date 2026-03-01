import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserList } from '@/features/admin/users/UserList';
import { QUERY_KEYS } from '@/constants';

export default async function Page() {
    const queryClient = new QueryClient();
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('access_token')?.value;

    // Nếu không có token, redirect ngay lập tức, không cần fetch
    if (!accessToken) {
        redirect('/login');
    }

    await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.USERS,
        queryFn: async () => {
            // Ưu tiên dùng API_URL (server internal network) nếu có, fallback về NEXT_PUBLIC_API_URL
            const apiUrl =
                process.env.API_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                'http://localhost:3001/api';

            const res = await fetch(`${apiUrl}/users`, {
                headers: {
                    // Chỉ gửi cookie cần thiết
                    Cookie: `access_token=${accessToken}`,
                },
                // Đảm bảo dữ liệu luôn mới nhất
                cache: 'no-store',
            });

            if (res.status === 401 || res.status === 403) {
                redirect('/login');
            }

            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }

            return res.json();
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <UserList />
        </HydrationBoundary>
    );
}
