import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Device } from '@/types/auth';

interface AuthState {
    user: User | null;
    device: Device | null;
    isAuthenticated: boolean;
    setAuthData: (user: User, device: Device) => void;
    clearAuthData: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            user: null,
            device: null,
            isAuthenticated: false,
            setAuthData: (user, device) => set({ user, device, isAuthenticated: true }),
            clearAuthData: () => set({ user: null, device: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        },
    ),
);
