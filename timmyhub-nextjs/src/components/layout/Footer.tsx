'use client';

import { Container, Text, Group, ActionIcon, rem, Box, Divider, Stack } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';

export function Footer() {
    return (
        <Box
            component="footer"
            py="xl"
            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
        >
            <Container size="md">
                <Group justify="space-between">
                    <Stack gap={4}>
                        <Text fw={800} size="lg" className="tracking-tight">
                            TIMMY<span className="text-blue-600">HUB</span>
                        </Text>
                        <Text size="xs" c="dimmed">
                            © 2026 TimmyHub. All rights reserved.
                        </Text>
                    </Stack>

                    <Group gap={0} justify="flex-end" wrap="nowrap">
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandTwitter
                                style={{ width: rem(18), height: rem(18) }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandYoutube
                                style={{ width: rem(18), height: rem(18) }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                        <ActionIcon size="lg" color="gray" variant="subtle">
                            <IconBrandInstagram
                                style={{ width: rem(18), height: rem(18) }}
                                stroke={1.5}
                            />
                        </ActionIcon>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
}
