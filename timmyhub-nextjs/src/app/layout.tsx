import type { Metadata } from 'next';
import { Public_Sans, Barlow } from 'next/font/google';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import './globals.css';
import { ColorSchemeScript } from '@mantine/core';
import { AppProvider } from '@/components';

const publicSans = Public_Sans({
    variable: '--font-public-sans',
    subsets: ['latin'],
    display: 'swap',
});

const barlow = Barlow({
    weight: ['900'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-barlow',
});

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=1';

export const metadata: Metadata = {
    title: {
        default: 'TimmyHub | Modern E-commerce Platform',
        template: '%s | TimmyHub',
    },
    description:
        'Hệ thống thương mại điện tử hiện đại, mạnh mẽ với quản trị RBAC linh hoạt và trải nghiệm người dùng tối ưu.',
    keywords: ['ecommerce', 'nextjs', 'mantine', 'marketplace', 'timmyhub'],
    authors: [{ name: 'TimmyHub Team' }],
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
            <body className={`${publicSans.variable} ${barlow.variable} antialiased font-public-sans`}>
                <AppProvider>{children}</AppProvider>
            </body>
        </html>
    );
}
