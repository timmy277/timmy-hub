'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@mantine/core';
import { ReactNode } from 'react';
import { Footer } from './Footer';

const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

interface MainShellProps {
    children: ReactNode;
}

export function MainShell({ children }: MainShellProps) {
    return (
        <AppShell header={{ height: 70 }} padding="md">
            <AppShell.Header>
                <AppBar withSidebarToggle={false} />
            </AppShell.Header>

            <AppShell.Main display="flex" style={{ flexDirection: 'column', minHeight: '100vh' }}>
                <div style={{ flex: 1 }}>{children}</div>
                <Footer />
            </AppShell.Main>
        </AppShell>
    );
}
