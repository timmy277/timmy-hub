'use client';

import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}
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
