/**
 * Trang xử lý OAuth callback sau khi BE redirect về.
 * Flow: Google/Facebook → BE sets HTTPOnly cookie → redirect đến đây → fetch profile → lưu store → redirect home.
 */
import { Suspense } from 'react';
import { OAuthCallbackClient } from '@/features/auth/OAuthCallbackClient';

export default function OAuthCallbackPage() {
    return (
        <Suspense>
            <OAuthCallbackClient />
        </Suspense>
    );
}
