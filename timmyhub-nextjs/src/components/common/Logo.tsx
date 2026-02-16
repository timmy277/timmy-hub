'use client';

import { Group, Box, Text, rem } from '@mantine/core';
import Link from 'next/link';

interface LogoProps {
    collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
    return (
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group
                gap={collapsed ? 0 : rem(12)}
                wrap="nowrap"
                justify={collapsed ? 'center' : 'flex-start'}
                className="transition-all duration-300"
            >
                <Box className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <Text
                        fw={900}
                        c="white"
                        size="lg"
                        className="tracking-tighter pl-[1px]"
                    >
                        T
                    </Text>
                </Box>

                <Box
                    className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                    style={{
                        maxWidth: collapsed ? 0 : '200px',
                        opacity: collapsed ? 0 : 1,
                        transform: `translateX(${collapsed ? '-10px' : '0'})`,
                    }}
                >
                    <Text fw={800} size="lg" className="tracking-tight ml-1">
                        TIMMY<span className="text-blue-600">HUB</span>
                    </Text>
                </Box>
            </Group>
        </Link>
    );
}
