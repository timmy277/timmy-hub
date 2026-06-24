import { Container, Stack, Skeleton } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header Skeleton */}
                <Stack gap="sm">
                    <Skeleton height={40} width={250} />
                    <Skeleton height={20} width={400} />
                </Stack>

                {/* Filter Bar Skeleton */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} height={36} width={100} radius="xl" />
                    ))}
                </div>

                {/* Products Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Stack key={i} gap="xs">
                            <Skeleton height={220} radius="md" />
                            <Skeleton height={20} />
                            <Skeleton height={20} width="70%" />
                            <Skeleton height={24} width="50%" />
                        </Stack>
                    ))}
                </div>
            </Stack>
        </Container>
    );
}
