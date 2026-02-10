import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        set => ({
            collapsed: false,
            setCollapsed: collapsed => set({ collapsed }),
            toggleSidebar: () => set(state => ({ collapsed: !state.collapsed })),
        }),
        {
            name: 'sidebar-storage',
        },
    ),
);
