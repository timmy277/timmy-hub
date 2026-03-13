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
import Iconify from '@/components/iconify/Iconify';
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
    // ===== Hooks & Context =====
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { primaryColor, setPrimaryColor } = useThemeStore();

    // ===== Final Render =====
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
                    <Iconify icon="solar:moon-bold" width={18} />
                ) : (
                    <Iconify icon="solar:sun-bold" width={18} />
                )}
            </ActionIcon>

            {/* Primary Color Picker */}
            <Popover width={220} position="bottom" withArrow shadow="md">
                <Popover.Target>
                    <Tooltip label="Change primary color">
                        <ActionIcon variant="default" size="lg" radius="md" c={primaryColor}>
                            <Iconify icon="solar:pallete-2-bold" width={18} />
                        </ActionIcon>
                    </Tooltip>
                </Popover.Target>
                <Popover.Dropdown p="md">
                    <Stack gap="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Primary Color
                        </Text>
                        <Group gap={7}>
                            {colors.map(color => (
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
                                        <Iconify
                                            icon="solar:check-bold"
                                            width={16}
                                        />
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
