'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@/libs/i18n';

interface AppProviderProps {
    children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const primaryColor = useThemeStore((state) => state.primaryColor);
    const [mounted, setMounted] = useState(false);

    // TanStack Query Client initialization
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    // Prevent hydration mismatch for client-side theme persistence
    useEffect(() => {
        setMounted(true);
    }, []);

    const theme = createTheme({
        primaryColor: mounted ? primaryColor : 'blue',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontFamilyMonospace: 'var(--font-geist-mono), monospace',
        defaultRadius: 'md',
        components: {
            Button: {
                defaultProps: {
                    radius: 'md',
                },
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={theme} defaultColorScheme="auto">
                <Notifications />
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </MantineProvider>
        </QueryClientProvider>
    );
}
