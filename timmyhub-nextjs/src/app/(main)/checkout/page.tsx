import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { LoadingPage } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <LoadingPage minHeight="100vh">
            <CheckoutPage />
        </LoadingPage>
    );
}
