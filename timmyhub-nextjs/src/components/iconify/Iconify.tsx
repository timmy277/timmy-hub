'use client';

import { Box } from '@mantine/core';
import { Icon, IconifyIcon } from '@iconify/react';

interface IconifyProps {
    icon: IconifyIcon | string;
    width?: number | string;
    height?: number | string;
    sx?: Record<string, unknown>;
    [key: string]: unknown;
}

export function Iconify({ icon, width = 20, height, sx, ...other }: IconifyProps) {
    return (
        <Box
            component={Icon}
            icon={icon}
            style={{ width, height: height || width, ...sx }}
            {...other}
        />
    );
}

export default Iconify;
