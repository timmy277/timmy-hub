'use client';

import dynamic from 'next/dynamic';
import { AppShell, useComputedColorScheme } from '@mantine/core';
import { ReactNode } from 'react';
import { Footer } from './Footer';

const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

interface MainShellProps {
    children: ReactNode;
}

export function MainShell({ children }: MainShellProps) {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    return (
        <AppShell header={{ height: 70 }} padding="md">
            <AppShell.Header 
                withBorder={isDark} 
                style={{ boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.05)' }}
            >
                <AppBar withSidebarToggle={false} />
            </AppShell.Header>

            <AppShell.Main display="flex" style={{ flexDirection: 'column', minHeight: '100vh' }}>
                <div style={{ flex: 1 }}>{children}</div>
                <Footer />
            </AppShell.Main>
        </AppShell>
    );
}
