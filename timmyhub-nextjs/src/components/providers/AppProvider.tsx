'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useState } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthSyncProvider } from './AuthSyncProvider';
import { AbilityProvider } from '@/contexts/AbilityContext';
import '@/libs/i18n';

interface AppProviderProps {
    children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const primaryColor = useThemeStore(state => state.primaryColor);

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
            }),
    );

    const theme = createTheme({
        primaryColor: primaryColor,
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
            <LazyMotion features={domAnimation} strict>
                <MantineProvider theme={theme} defaultColorScheme="auto">
                    <ModalsProvider
                        modalProps={{
                            centered: true,
                            overlayProps: {
                                backgroundOpacity: 0.55,
                                blur: 3,
                            },
                        }}
                    >
                        <Notifications position="top-right" />
                        <AuthSyncProvider>
                            <AbilityProvider>{children}</AbilityProvider>
                        </AuthSyncProvider>
                        <ReactQueryDevtools initialIsOpen={false} />
                    </ModalsProvider>
                </MantineProvider>
            </LazyMotion>
        </QueryClientProvider>
    );
}
