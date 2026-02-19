'use client';

import dynamic from 'next/dynamic';
import { AppShell, useComputedColorScheme } from '@mantine/core';
import type { ReactNode } from 'react';
import { Footer } from './Footer';

const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

interface UserLayoutProps {
    children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    return (
        <AppShell header={{ height: 70 }} padding="md">
            <AppShell.Header
                withBorder={isDark}
                style={{
                    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
            >
                <AppBar withSidebarToggle={false} />
            </AppShell.Header>

            <AppShell.Main
                display="flex"
                style={{ flexDirection: 'column', minHeight: '100vh' }}
            >
                <div className="flex-1">{children}</div>
                <Footer />
            </AppShell.Main>
        </AppShell>
    );
}
