import { Container, Stack, Skeleton } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Hero Section Skeleton */}
                <Skeleton height={400} radius="md" />

                {/* Categories Skeleton */}
                <Stack gap="md">
                    <Skeleton height={32} width={200} />
                    <Skeleton height={120} radius="md" />
                </Stack>

                {/* Flash Sale Skeleton */}
                <Stack gap="md">
                    <Skeleton height={32} width={200} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Stack key={i} gap="xs">
                                <Skeleton height={200} radius="md" />
                                <Skeleton height={20} />
                                <Skeleton height={24} width="60%" />
                            </Stack>
                        ))}
                    </div>
                </Stack>

                {/* Featured Products Skeleton */}
                <Stack gap="md">
                    <Skeleton height={32} width={200} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Stack key={i} gap="xs">
                                <Skeleton height={200} radius="md" />
                                <Skeleton height={20} />
                                <Skeleton height={24} width="60%" />
                            </Stack>
                        ))}
                    </div>
                </Stack>
            </Stack>
        </Container>
    );
}
