import { Container, Stack, Skeleton } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Search Header Skeleton */}
                <Stack gap="sm">
                    <Skeleton height={32} width={300} />
                    <Skeleton height={20} width={200} />
                </Stack>

                {/* Filter and Sort Bar Skeleton */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} height={36} width={80} radius="sm" />
                        ))}
                    </div>
                    <Skeleton height={36} width={150} radius="sm" />
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
