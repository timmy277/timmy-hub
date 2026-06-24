import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Shop Header Skeleton */}
                <Paper p="xl" radius="md" withBorder>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Skeleton height={100} width={100} radius="md" />
                        <Stack gap="sm" style={{ flex: 1 }}>
                            <Skeleton height={32} width={250} />
                            <Skeleton height={20} width={400} />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Skeleton height={20} width={120} />
                                <Skeleton height={20} width={120} />
                            </div>
                        </Stack>
                    </div>
                </Paper>

                {/* Categories and Filter Skeleton */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} height={36} width={100} radius="xl" />
                    ))}
                </div>

                {/* Products Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Stack key={i} gap="xs">
                            <Skeleton height={220} radius="md" />
                            <Skeleton height={20} />
                            <Skeleton height={20} width="80%" />
                            <Skeleton height={24} width="60%" />
                        </Stack>
                    ))}
                </div>
            </Stack>
        </Container>
    );
}
