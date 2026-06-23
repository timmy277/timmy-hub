'use client';

import { Group, Box, Text, rem } from '@mantine/core';
import Link from 'next/link';
import { useThemeStore } from '@/stores/useThemeStore';
import { useMantineTheme } from '@mantine/core';

interface LogoProps {
    collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
    const primaryColor = useThemeStore(state => state.primaryColor);
    const theme = useMantineTheme();
    const colorValue = theme.colors[primaryColor]?.[6] || '#228be6';

    return (
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group
                gap={collapsed ? 0 : rem(12)}
                wrap="nowrap"
                justify={collapsed ? 'center' : 'flex-start'}
                className="transition-all duration-300"
            >
                <Box
                    style={{
                        width: rem(36),
                        height: rem(36),
                        position: 'relative',
                        flexShrink: 0,
                    }}
                >
                    <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: '100%', height: '100%' }}
                    >
                        {/* Background Circle - Hub Center */}
                        <circle
                            cx="50"
                            cy="50"
                            r="48"
                            fill="url(#logoGradient)"
                            style={{
                                filter: 'drop-shadow(0 4px 12px rgba(34, 139, 230, 0.25))',
                            }}
                        />

                        {/* Center Hub */}
                        <circle cx="50" cy="50" r="14" fill="white" opacity="0.95" />

                        {/* Connection Nodes */}
                        <circle cx="50" cy="20" r="8" fill="white" opacity="0.9" />
                        <circle cx="74" cy="35" r="8" fill="white" opacity="0.9" />
                        <circle cx="74" cy="65" r="8" fill="white" opacity="0.9" />
                        <circle cx="50" cy="80" r="8" fill="white" opacity="0.9" />
                        <circle cx="26" cy="65" r="8" fill="white" opacity="0.9" />
                        <circle cx="26" cy="35" r="8" fill="white" opacity="0.9" />

                        {/* Connection Lines */}
                        <line x1="50" y1="36" x2="50" y2="28" stroke="white" strokeWidth="3" opacity="0.8" />
                        <line x1="60" y1="43" x2="66" y2="38" stroke="white" strokeWidth="3" opacity="0.8" />
                        <line x1="60" y1="57" x2="66" y2="62" stroke="white" strokeWidth="3" opacity="0.8" />
                        <line x1="50" y1="64" x2="50" y2="72" stroke="white" strokeWidth="3" opacity="0.8" />
                        <line x1="40" y1="57" x2="34" y2="62" stroke="white" strokeWidth="3" opacity="0.8" />
                        <line x1="40" y1="43" x2="34" y2="38" stroke="white" strokeWidth="3" opacity="0.8" />

                        {/* Letter T in center */}
                        <text
                            x="50"
                            y="56"
                            textAnchor="middle"
                            fill={colorValue}
                            fontSize="20"
                            fontWeight="900"
                            fontFamily="var(--font-barlow)"
                        >
                            T
                        </text>

                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colorValue} />
                                <stop offset="100%" stopColor={colorValue} stopOpacity="0.8" />
                            </linearGradient>
                        </defs>
                    </svg>
                </Box>

                {/* Logo Text */}
                <Box
                    className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap"
                    style={{
                        maxWidth: collapsed ? 0 : '200px',
                        opacity: collapsed ? 0 : 1,
                        transform: `translateX(${collapsed ? '-10px' : '0'})`,
                    }}
                >
                    <Text
                        fw={900}
                        size="xl"
                        style={{
                            fontFamily: 'var(--font-barlow)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                        }}
                    >
                        Timmy
                        <Text
                            span
                            fw={900}
                            style={{
                                color: colorValue,
                                fontFamily: 'var(--font-barlow)',
                            }}
                        >
                            Hub
                        </Text>
                    </Text>
                </Box>
            </Group>
        </Link>
    );
}
