import { Container, Stack, Skeleton } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header Skeleton */}
                <Stack gap="sm">
                    <Skeleton height={40} width={200} />
                    <Skeleton height={20} width={300} />
                </Stack>

                {/* Categories Filter Skeleton */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} height={36} width={100} radius="xl" />
                    ))}
                </div>

                {/* Posts Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Stack key={i} gap="xs">
                            <Skeleton height={200} radius="md" />
                            <Skeleton height={24} />
                            <Skeleton height={16} />
                            <Skeleton height={16} width="70%" />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <Skeleton height={16} width={80} />
                                <Skeleton height={16} width={80} />
                            </div>
                        </Stack>
                    ))}
                </div>
            </Stack>
        </Container>
    );
}
