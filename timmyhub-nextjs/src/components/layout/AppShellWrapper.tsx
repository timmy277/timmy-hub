'use client';

import dynamic from 'next/dynamic';
import { AppShell, useComputedColorScheme } from '@mantine/core';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { useMounted } from '@mantine/hooks';
import { ReactNode } from 'react';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';

// Nạp động các thành phần Client-only
const Sidebar = dynamic(() => import('./Sidebar').then(m => m.Sidebar), { ssr: false });
const AppBar = dynamic(() => import('./AppBar').then(m => m.AppBar), { ssr: false });

export type ShellType = 'main' | 'admin' | 'seller';

interface AppShellWrapperProps {
    children: ReactNode;
    type?: ShellType;
    withFooter?: boolean;
}

export function AppShellWrapper({
    children,
    type = 'main',
    withFooter = true
}: AppShellWrapperProps) {
    const { t } = useTranslation();
    const { collapsed } = useSidebarStore();
    const mounted = useMounted();
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    const isCollapsed = mounted ? collapsed : false;
    const navbarWidth = isCollapsed ? 80 : 280;

    // Header height theo từng loại shell
    const headerHeight = type === 'main' ? 60 : 60;

    // Cấu hình AppShell
    const appShellProps = type === 'main'
        ? {
            // Main shell: chỉ có header
            header: { height: headerHeight },
        }
        : {
            // Admin/Seller shell: có header + sidebar
            header: { height: headerHeight },
            navbar: {
                width: navbarWidth,
                breakpoint: 'sm',
            },
        };

    return (
        <AppShell
            id={`${type}-app-shell`}
            layout="alt"
            padding="md"
            {...appShellProps}
        >
            <AppShell.Header
                withBorder={isDark}
                style={{
                    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
            >
                <AppBar withSidebarToggle={type !== 'main'} />
            </AppShell.Header>

            {type !== 'main' && (
                <AppShell.Navbar>
                    <Sidebar />
                </AppShell.Navbar>
            )}

            <AppShell.Main
                display="flex"
                style={{
                    flexDirection: 'column',
                    minHeight: type === 'main'
                        ? '100vh'
                        : 'calc(100vh - var(--app-shell-header-height, 70px))',
                    backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))',
                }}
            >
                <div className='flex-1'>{children}</div>

                {withFooter && (
                    type === 'seller' ? (
                        <footer style={{
                            padding: 'var(--mantine-spacing-md)',
                            borderTop: '1px solid var(--mantine-color-default-border)'
                        }}>
                            <small style={{ color: 'var(--mantine-color-dimmed)' }}>
                                {t('seller.footer', 'TimmyHub Seller Center')}
                            </small>
                        </footer>
                    ) : (
                        <Footer />
                    )
                )}
            </AppShell.Main>
        </AppShell>
    );
}

// Export các component cũ để tương thích ngược
export { MainShell } from './MainShell';
export { DashboardShell } from './DashboardShell';
export { SellerShell } from './SellerShell';
