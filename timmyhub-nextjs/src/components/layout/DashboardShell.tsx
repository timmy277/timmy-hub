'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@mantine/core';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { ReactNode } from 'react';
import { Footer } from './Footer';
import { useMounted } from '@mantine/hooks';

// Nạp động các thành phần Client-only
const Sidebar = dynamic(() => import('./Sidebar').then(m => m.Sidebar), { ssr: false });
const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

interface DashboardShellProps {
    children: ReactNode;
    withFooter?: boolean;
}

export function DashboardShell({ children, withFooter = true }: DashboardShellProps) {
    // ===== Hooks & Context =====
    const { collapsed } = useSidebarStore();
    const mounted = useMounted();

    // ===== Component Logic =====
    const isCollapsed = mounted ? collapsed : false;
    const navbarWidth = isCollapsed ? 80 : 280;

    // ===== Final Render =====
    return (
        <AppShell
            id="main-app-shell"
            layout="alt"
            header={{ height: 70 }}
            navbar={{
                width: navbarWidth,
                breakpoint: 'sm',
            }}
            padding="md"
        >
            <AppShell.Header>
                <AppBar />
            </AppShell.Header>

            <AppShell.Navbar>
                <Sidebar />
            </AppShell.Navbar>

            <AppShell.Main
                display="flex"
                style={{
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - var(--app-shell-header-height, 70px))',
                    backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))',
                }}
            >
                {/* Content Area */}
                <div style={{ flex: 1 }}>{children}</div>

                {/* Footer Section */}
                {withFooter && <Footer />}
            </AppShell.Main>
        </AppShell>
    );
}
