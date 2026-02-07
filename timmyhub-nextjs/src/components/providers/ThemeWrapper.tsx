'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { useThemeStore } from '@/stores/useThemeStore';
import { Notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const primaryColor = useThemeStore((state) => state.primaryColor);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const theme = createTheme({
        primaryColor: mounted ? primaryColor : 'blue',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontFamilyMonospace: 'var(--font-geist-mono), monospace',
    });

    return (
        <MantineProvider theme={theme} defaultColorScheme="auto">
            <Notifications />
            {children}
        </MantineProvider>
    );
}
