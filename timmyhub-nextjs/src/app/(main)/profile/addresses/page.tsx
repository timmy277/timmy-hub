import { ProfileAddressesContent } from '@/features/profile/ProfileAddressesContent';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfileAddressesPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/profile/addresses');
    }

    return <ProfileAddressesContent />;
}
