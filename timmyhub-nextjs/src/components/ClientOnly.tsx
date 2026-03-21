'use client';

import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Client-only wrapper component
 * 
 * Prevents hydration mismatches by only rendering children on the client side.
 * Uses useSyncExternalStore for hydration-safe mounting detection.
 * This is the recommended pattern by React team for avoiding hydration issues.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const subscribeNoop = () => () => {};
    const getServerSnapshot = () => false;
    const getClientSnapshot = () => true;

    const isClient = useSyncExternalStore(
        subscribeNoop,
        getClientSnapshot,
        getServerSnapshot
    );

    if (!isClient) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
