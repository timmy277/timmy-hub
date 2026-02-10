'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthSyncProvider({ children }: { children: ReactNode }) {
    // ===== Hooks & Context =====
    const { isAuthenticated, refetchProfile, logout } = useAuth();
    const { user } = useAuthStore();

    // ===== Component Logic =====
    useEffect(() => {
        // Nếu đã authenticated trong store (từ persistence),
        // hãy re-fetch profile để đảm bảo session vẫn còn hiệu lực ở server
        if (isAuthenticated) {
            refetchProfile().then(result => {
                if (result.isError) {
                    // Nếu lỗi (401), force logout để xóa store địa phương
                    logout();
                }
            });
        }
    }, []);

    // ===== Final Render =====

    return <>{children}</>;
}
