'use client';

import NextTopLoader from 'nextjs-toploader';
import { useThemeStore } from '@/stores/useThemeStore';
import { useMantineTheme } from '@mantine/core';

export function TopLoader() {
    const primaryColor = useThemeStore(state => state.primaryColor);
    const theme = useMantineTheme();

    // Get primary color value from Mantine theme
    const color = theme.colors[primaryColor][6];

    return (
        <NextTopLoader
            color={color}
            height={3}
            showSpinner={false}
            shadow={`0 0 10px ${color},0 0 5px ${color}`}
        />
    );
}
