import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PrimaryColor = 'blue' | 'cyan' | 'grape' | 'green' | 'indigo' | 'orange' | 'pink' | 'red' | 'teal' | 'violet';

interface ThemeState {
    primaryColor: PrimaryColor;
    setPrimaryColor: (color: PrimaryColor) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            primaryColor: 'blue',
            setPrimaryColor: (color) => set({ primaryColor: color }),
        }),
        {
            name: 'theme-storage',
        }
    )
);
