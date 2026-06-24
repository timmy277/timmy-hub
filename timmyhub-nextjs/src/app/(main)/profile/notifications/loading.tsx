import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                {/* Header Skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton height={32} width={200} />
                    <Skeleton height={36} width={120} radius="md" />
                </div>

                {/* Notifications List Skeleton */}
                <Stack gap="xs">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Paper key={i} p="md" radius="md" withBorder>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <Skeleton height={40} width={40} radius="xl" />
                                <Stack gap="xs" style={{ flex: 1 }}>
                                    <Skeleton height={20} width="70%" />
                                    <Skeleton height={16} width="90%" />
                                    <Skeleton height={14} width={100} />
                                </Stack>
                            </div>
                        </Paper>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
