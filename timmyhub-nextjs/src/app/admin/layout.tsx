/**
 * Admin Layout - Bọc tất cả trang admin bằng DashboardShell (AppBar + Sidebar)
 * Thực hiện auth guard tại server-side: redirect về /login nếu không có access_token
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login');
    }

    return <DashboardShell withFooter={false}>{children}</DashboardShell>;
}
