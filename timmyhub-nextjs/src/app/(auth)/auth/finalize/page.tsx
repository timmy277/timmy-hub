import { Suspense } from 'react';
import { OAuthCallbackClient } from '@/features/auth/OAuthCallbackClient';

export default function FinalizePage() {
    return (
        <Suspense>
            <OAuthCallbackClient />
        </Suspense>
    );
}
