import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CategoryList from '@/features/admin/categories/CategoryList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản lý danh mục | TimmyHub Admin',
    description: 'Quản lý danh mục sản phẩm của hệ thống',
};

export default async function AdminCategoriesPage() {
    const queryClient = new QueryClient();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    await queryClient.prefetchQuery({
        queryKey: ['categories', true], // match hook useCategories(true)
        queryFn: async () => {
            const apiUrl =
                process.env.API_URL ||
                process.env.NEXT_PUBLIC_API_URL ||
                'http://localhost:3001/api';

            const res = await fetch(`${apiUrl}/categories?includeInactive=true`, {
                headers: {
                    Cookie: `access_token=${accessToken}`,
                },
                cache: 'no-store',
            });

            if (res.status === 401 || res.status === 403) {
                redirect('/login');
            }

            if (!res.ok) {
                throw new Error('Failed to fetch categories');
            }

            return res.json();
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CategoryList />
        </HydrationBoundary>
    );
}
