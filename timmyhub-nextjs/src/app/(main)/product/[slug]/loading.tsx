import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Product Detail Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Image Gallery Skeleton */}
                    <Stack gap="md">
                        <Skeleton height={400} radius="md" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} height={80} radius="md" />
                            ))}
                        </div>
                    </Stack>

                    {/* Product Info Skeleton */}
                    <Stack gap="md">
                        <Skeleton height={36} width="80%" />
                        <Skeleton height={24} width={150} />
                        <Skeleton height={20} width={200} />

                        <Stack gap="xs" mt="md">
                            <Skeleton height={16} width={100} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} height={40} width={60} radius="md" />
                                ))}
                            </div>
                        </Stack>

                        <Stack gap="xs" mt="md">
                            <Skeleton height={16} width={100} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} height={40} width={80} radius="md" />
                                ))}
                            </div>
                        </Stack>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <Skeleton height={48} style={{ flex: 1 }} radius="md" />
                            <Skeleton height={48} style={{ flex: 1 }} radius="md" />
                        </div>
                    </Stack>
                </div>

                {/* Product Description Skeleton */}
                <Paper p="md" radius="md" withBorder>
                    <Stack gap="md">
                        <Skeleton height={24} width={200} />
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height={16} />
                        ))}
                    </Stack>
                </Paper>

                {/* Related Products Skeleton */}
                <Stack gap="md">
                    <Skeleton height={28} width={200} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
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
