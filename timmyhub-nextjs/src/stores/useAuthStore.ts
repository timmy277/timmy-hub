import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Device } from '@/types/auth';

interface AuthState {
    user: User | null;
    device: Device | null;
    isAuthenticated: boolean;
    /** true khi Zustand đã rehydrate xong từ localStorage */
    _hasHydrated: boolean;
    setAuthData: (user: User, device: Device) => void;
    clearAuthData: () => void;
    setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            user: null,
            device: null,
            isAuthenticated: false,
            _hasHydrated: false,
            setAuthData: (user, device) => set({ user, device, isAuthenticated: true }),
            clearAuthData: () => set({ user: null, device: null, isAuthenticated: false }),
            setHasHydrated: (value) => set({ _hasHydrated: value }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => state => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
