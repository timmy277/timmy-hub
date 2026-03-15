import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminChat } from '@/features/admin/chat/AdminChat';
import { Suspense } from 'react';
import { Loader, Group } from '@mantine/core';
import { QUERY_KEYS } from '@/constants';

export const metadata = {
    title: 'Quản lý Trò chuyện | TimmyHub Admin',
};

export default async function Page() {
    const queryClient = new QueryClient();
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.CHAT_ADMIN,
        queryFn: async () => {
            const apiUrl =
                process.env.API_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                'http://localhost:3001/api';

            const res = await fetch(`${apiUrl}/chat/admin/contacts`, {
                headers: {
                    Cookie: `access_token=${accessToken}`,
                },
                cache: 'no-store',
            });

            if (res.status === 401 || res.status === 403) {
                redirect('/login');
            }

            if (!res.ok) {
                throw new Error('Failed to fetch chat contacts');
            }

            return res.json();
        },
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 105px)' }}>
            <Suspense fallback={<Group justify="center" mt="xl"><Loader /></Group>}>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <AdminChat />
                </HydrationBoundary>
            </Suspense>
        </div>
    );
}
