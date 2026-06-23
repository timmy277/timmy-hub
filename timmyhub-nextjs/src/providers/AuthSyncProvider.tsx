'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';

export function AuthSyncProvider({ children }: { children: ReactNode }) {
    const { user, setAuthData } = useAuthStore();
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!user) {
            hasFetchedRef.current = false;
            return;
        }
        // Đã có đủ profile (avatar/displayName) thì không fetch lại
        if (user.profile?.firstName != null || user.profile?.displayName) {
            return;
        }
        if (hasFetchedRef.current) return;

        hasFetchedRef.current = true;
        const syncProfile = async () => {
            const storeDevice = useAuthStore.getState().device;
            let device = storeDevice;
            if (!device) {
                device = { id: 'web', name: 'web', deviceId: 'web' };
            }
            try {
                const response = await authService.getProfile();
                const profileUser = response.data;
                setAuthData(profileUser, device);
            } catch {
                hasFetchedRef.current = false;
            }
        };
        void syncProfile();
    }, [setAuthData, user]);

    return <>{children}</>;
}
