'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@mantine/core';

const AppBar = dynamic(() => import('@/components/layout/AppBar').then(m => m.AppBar), { ssr: false });

export default function PostsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell header={{ height: 60 }} padding={0}>
            <AppShell.Header>
                <AppBar withSidebarToggle={false} />
            </AppShell.Header>
            <AppShell.Main style={{ paddingTop: 60, height: '100dvh', overflow: 'hidden' }}>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}
