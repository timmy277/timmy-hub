import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Device } from '@/types/auth';

interface AuthState {
    user: User | null;
    device: Device | null;
    isAuthenticated: boolean;
    setAuth: (user: User, device: Device) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            device: null,
            isAuthenticated: false,
            setAuth: (user, device) => set({ user, device, isAuthenticated: true }),
            clearAuth: () => set({ user: null, device: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
