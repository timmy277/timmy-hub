import { WishlistPageContent } from '@/features/profile/WishlistContent';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/profile/wishlist');
    }

    return <WishlistPageContent />;
}
