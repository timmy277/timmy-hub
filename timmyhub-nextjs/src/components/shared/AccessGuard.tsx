'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { ReactNode, useEffect } from 'react';

interface GuardProps {
    children: ReactNode;
    permissions?: string[];
    role?: string;
    fallback?: ReactNode;
}

/**
 * AccessGuard component to wrap protected UI elements.
 * It checks for authentication and optional permissions/roles.
 */
export const AccessGuard = ({ children, permissions, role, fallback = null }: GuardProps) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    // Check for specific role if provided
    if (role && user.role !== role && user.role !== 'SUPER_ADMIN') {
        return <>{fallback}</>;
    }

    // Check for permissions if provided
    if (permissions && permissions.length > 0 && user.role !== 'SUPER_ADMIN') {
        const hasAllPermissions = permissions.every(p => user.permissions.includes(p));
        if (!hasAllPermissions) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
};
