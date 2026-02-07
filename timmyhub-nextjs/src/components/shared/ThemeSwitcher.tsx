'use client';

import {
    ActionIcon,
    useMantineColorScheme,
    useComputedColorScheme,
    Group,
    Popover,
    Text,
    Stack,
    UnstyledButton,
    rem,
    Tooltip,
} from '@mantine/core';
import { IconSun, IconMoon, IconPalette, IconCheck } from '@tabler/icons-react';
import { useThemeStore, PrimaryColor } from '@/stores/useThemeStore';

const colors: PrimaryColor[] = [
    'blue',
    'cyan',
    'teal',
    'green',
    'orange',
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
];

export function ThemeSwitcher() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { primaryColor, setPrimaryColor } = useThemeStore();

    return (
        <Group gap="xs">
            {/* Light/Dark Toggle */}
            <ActionIcon
                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
                radius="md"
            >
                {computedColorScheme === 'light' ? (
                    <IconMoon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                ) : (
                    <IconSun style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                )}
            </ActionIcon>

            {/* Primary Color Picker */}
            <Popover width={220} position="bottom" withArrow shadow="md">
                <Popover.Target>
                    <Tooltip label="Change primary color">
                        <ActionIcon variant="default" size="lg" radius="md" c={primaryColor}>
                            <IconPalette style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                </Popover.Target>
                <Popover.Dropdown p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Primary Color
                        </Text>
                        <Group gap={7}>
                            {colors.map((color) => (
                                <UnstyledButton
                                    key={color}
                                    onClick={() => setPrimaryColor(color)}
                                    style={{
                                        width: rem(30),
                                        height: rem(30),
                                        borderRadius: rem(4),
                                        backgroundColor: `var(--mantine-color-${color}-filled)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        transition: 'transform 100ms ease',
                                    }}
                                    className="hover:scale-105 active:scale-95"
                                >
                                    {primaryColor === color && (
                                        <IconCheck style={{ width: rem(16), height: rem(16) }} stroke={3} />
                                    )}
                                </UnstyledButton>
                            ))}
                        </Group>
                    </Stack>
                </Popover.Dropdown>
            </Popover>
        </Group>
    );
}
