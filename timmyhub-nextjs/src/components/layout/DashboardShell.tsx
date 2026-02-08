'use client';

import dynamic from 'next/dynamic';
import { AppShell, ScrollArea, useMantineColorScheme } from '@mantine/core';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { ReactNode } from 'react';
import { Footer } from './Footer';

// Nạp động các thành phần Client-only
const Sidebar = dynamic(() => import('./Sidebar').then((m) => m.Sidebar), { ssr: false });
const AppBar = dynamic(() => import('./AppBar').then((m) => m.AppBar), { ssr: false });

interface DashboardShellProps {
    children: ReactNode;
    withFooter?: boolean;
}

export function DashboardShell({ children, withFooter = true }: DashboardShellProps) {
    const { collapsed } = useSidebarStore();

    return (
        <AppShell
            layout="alt"
            header={{ height: 70 }}
            navbar={{
                width: collapsed ? 80 : 280,
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
                bg="body"
                style={{ flexDirection: 'column', minHeight: '100vh' }}
            >
                {/* Content Area */}
                <div style={{ flex: 1 }}>
                    {children}
                </div>

                {/* Footer Section */}
                {withFooter && <Footer />}
            </AppShell.Main>
        </AppShell>
    );
}
