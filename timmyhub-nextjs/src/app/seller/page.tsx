import { SellerDashboard } from '@/features/seller';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SellerDashboardPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/seller');
    }

    return <SellerDashboard />;
}
