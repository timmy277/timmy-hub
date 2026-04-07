'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@mantine/core';
import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { ChatWidget } from '@/features/chat/components/ChatWidget';

const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

interface UserLayoutProps {
    children: ReactNode;
    withFooter?: boolean;
}

export function UserLayout({ children, withFooter = true }: UserLayoutProps) {
    return (
        <AppShell header={{ height: 60 }} padding="md">
            <AppShell.Header
                style={{
                    boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.05), none)',
                }}
                suppressHydrationWarning
            >
                <AppBar withSidebarToggle={false} />
            </AppShell.Header>

            <AppShell.Main
                display="flex"
                style={{
                    flexDirection: 'column',
                    minHeight: '100vh',
                    backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))',
                }}
            >
                <div className="flex-1">{children}</div>
                {withFooter && <Footer />}
            </AppShell.Main>
            <ChatWidget />
        </AppShell>
    );
}
