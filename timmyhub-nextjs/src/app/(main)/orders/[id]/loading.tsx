import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                {/* Header Skeleton */}
                <Paper p="md" radius="md" withBorder>
                    <Stack gap="sm">
                        <Skeleton height={32} width={250} />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Skeleton height={20} width={150} />
                            <Skeleton height={20} width={150} />
                        </div>
                    </Stack>
                </Paper>

                {/* Order Items Skeleton */}
                <Paper p="md" radius="md" withBorder>
                    <Stack gap="md">
                        <Skeleton height={24} width={150} />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Skeleton height={80} width={80} radius="md" />
                                <Stack gap="xs" style={{ flex: 1 }}>
                                    <Skeleton height={20} width="70%" />
                                    <Skeleton height={16} width="40%" />
                                    <Skeleton height={20} width={100} />
                                </Stack>
                            </div>
                        ))}
                    </Stack>
                </Paper>

                {/* Order Summary Skeleton */}
                <Paper p="md" radius="md" withBorder>
                    <Stack gap="sm">
                        <Skeleton height={24} width={150} />
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Skeleton height={20} width={120} />
                                <Skeleton height={20} width={100} />
                            </div>
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
