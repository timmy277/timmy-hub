'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { ReactNode } from 'react';
import { hasPermissions } from '@/config/permissions';
import { UserRole } from '@/types/auth';

interface GuardProps {
    children: ReactNode;
    permissions?: string[];
    role?: UserRole | string;
    fallback?: ReactNode;
}

/**
 * AccessGuard component to wrap protected UI elements.
 * It checks for authentication and optional permissions/roles.
 * Sử dụng permission hierarchy system để check permissions.
 */
export const AccessGuard = ({ children, permissions, role, fallback = null }: GuardProps) => {
    const { isAuthenticated, user } = useAuthStore();

    // Check authentication
    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    // Super admin bypass all checks
    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
        return <>{children}</>;
    }

    // Check for specific role if provided
    if (role && !user.roles?.includes(role as UserRole)) {
        return <>{fallback}</>;
    }

    // Check for permissions with hierarchy support
    if (permissions && permissions.length > 0) {
        const userHasPermissions = hasPermissions(user.permissions, permissions);
        if (!userHasPermissions) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
};
