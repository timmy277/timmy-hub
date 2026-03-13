'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@mantine/core';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useMounted } from '@mantine/hooks';
import type { ReactNode } from 'react';

const Sidebar = dynamic(
    () => import('./Sidebar').then(m => m.Sidebar),
    { ssr: false },
);
const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

interface SellerShellProps {
    children: ReactNode;
    withFooter?: boolean;
}

export function SellerShell({ children, withFooter = true }: SellerShellProps) {
    const { collapsed } = useSidebarStore();
    const mounted = useMounted();
    const navbarWidth = mounted && collapsed ? 80 : 280;

    return (
        <AppShell
            id="seller-app-shell"
            layout="alt"
            header={{ height: 70 }}
            navbar={{
                width: navbarWidth,
                breakpoint: 'sm',
            }}
            padding="md"
        >
            <AppShell.Header>
                <AppBar withSidebarToggle={true} />
            </AppShell.Header>
            <AppShell.Navbar>
                <Sidebar />
            </AppShell.Navbar>
            <AppShell.Main
                display="flex"
                style={{
                    flexDirection: 'column',
                    minHeight: '100vh',
                    backgroundColor:
                        'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))',
                }}
            >
                <div className='flex-1'>{children}</div>
                {withFooter && (
                    <footer style={{ padding: 'var(--mantine-spacing-md)', borderTop: '1px solid var(--mantine-color-default-border)' }}>
                        <small style={{ color: 'var(--mantine-color-dimmed)' }}>
                            TimmyHub Seller Center
                        </small>
                    </footer>
                )}
            </AppShell.Main>
        </AppShell>
    );
}
