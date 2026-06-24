import { ProfileOrdersPage } from "@/features/profile/ProfileOrdersPage";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/profile/orders');
    }

    return <ProfileOrdersPage />;
}
