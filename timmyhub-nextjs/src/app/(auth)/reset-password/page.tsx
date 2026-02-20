import { Suspense } from 'react';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';

function ResetPasswordFallback() {
    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordPage />
        </Suspense>
    );
}
