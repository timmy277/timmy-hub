'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';

export function AuthSyncProvider({ children }: { children: ReactNode }) {
    // ===== Hooks & Context =====
    const { isAuthenticated, refetchProfile, logout } = useAuth();
    const { user, setAuthData, clearAuthData } = useAuthStore();

    // ===== Component Logic =====
    useEffect(() => {
        const syncAuth = async () => {
            const accessToken = Cookies.get('access_token');

            console.log('🔄 AuthSync:', {
                hasToken: !!accessToken,
                isAuthenticated,
                hasUserInStore: !!user,
            });

            if (accessToken && !user) {
                console.log('🔑 Token exists but no user in store, fetching profile...');
                try {
                    const response = await authService.getProfile();
                    const profileUser = response.data;
                    console.log('👤 Profile fetched:', profileUser);
                    setAuthData(profileUser, { deviceId: 'web', userAgent: navigator.userAgent });
                } catch (error) {
                    console.error('❌ Failed to fetch profile, clearing auth:', error);
                    clearAuthData();
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                }
            } else if (isAuthenticated && user) {
                console.log('✅ Already authenticated, re-validating session...');
                refetchProfile().then(result => {
                    if (result.isError) {
                        console.warn('⚠️ Session invalid, logging out...');
                        logout();
                    }
                });
            } else if (!accessToken && isAuthenticated) {
                console.warn('⚠️ No token but store says authenticated, clearing...');
                clearAuthData();
            }
        };

        syncAuth();
    }, []);

    // ===== Final Render =====

    return <>{children}</>;
}
