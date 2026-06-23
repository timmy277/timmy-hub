import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { LoadingPage } from '@/components/ui';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/checkout');
    }

    return (
        <LoadingPage minHeight="100vh">
            <CheckoutPage />
        </LoadingPage>
    );
}
