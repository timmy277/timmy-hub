import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Campaign Header Skeleton */}
                <Paper p="xl" radius="md" withBorder>
                    <Stack gap="md">
                        <Skeleton height={40} width="60%" />
                        <Skeleton height={20} width="80%" />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <Skeleton height={20} width={150} />
                            <Skeleton height={20} width={150} />
                        </div>
                    </Stack>
                </Paper>

                {/* Campaign Banner Skeleton */}
                <Skeleton height={300} radius="md" />

                {/* Products Grid Skeleton */}
                <Stack gap="md">
                    <Skeleton height={28} width={200} />
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
            </Stack>
        </Container>
    );
}
