import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@mantine/core/styles.css';
import './globals.css';
import { ColorSchemeScript } from '@mantine/core';
import { AppProvider } from '@/components';
import '@mantine/notifications/styles.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: 'TimmyHub | Modern E-commerce Platform',
        template: '%s | TimmyHub',
    },
    description:
        'Hệ thống thương mại điện tử hiện đại, mạnh mẽ với quản trị RBAC linh hoạt và trải nghiệm người dùng tối ưu.',
    keywords: ['ecommerce', 'nextjs', 'mantine', 'marketplace', 'timmyhub'],
    authors: [{ name: 'TimmyHub Team' }],
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AppProvider>{children}</AppProvider>
            </body>
        </html>
    );
}
