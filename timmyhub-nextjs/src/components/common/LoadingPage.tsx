'use client';

import { ClientOnly } from './ClientOnly';

interface LoadingPageProps {
    children: React.ReactNode;
    minHeight?: string;
    showSpinner?: boolean;
}

export function LoadingPage({ children, minHeight = '50vh', showSpinner = true }: LoadingPageProps) {
    return (
        <ClientOnly
            fallback={
                <div
                    className={`flex items-center justify-center bg-[#f6f7f8] dark:bg-[#111a21] min-h-[${minHeight}]`}
                >
                    <div className="flex flex-col items-center gap-4">
                        {showSpinner && (
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#238be7] border-t-transparent" />
                        )}
                    </div>
                </div>
            }
        >
            {children}
        </ClientOnly>
    );
}
