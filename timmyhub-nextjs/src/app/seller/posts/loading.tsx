import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="md">
            <Stack gap="lg">
                {/* Header with Actions Skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton height={32} width={200} />
                    <Skeleton height={40} width={150} radius="md" />
                </div>

                {/* Filter Bar Skeleton */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Skeleton height={36} width={200} radius="sm" />
                    <Skeleton height={36} width={150} radius="sm" />
                </div>

                {/* Posts Table Skeleton */}
                <Paper p="md" radius="md" withBorder>
                    <Stack gap="md">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: i < 7 ? '1px solid #eee' : 'none' }}>
                                <Skeleton height={60} width={80} radius="md" />
                                <Stack gap="xs" style={{ flex: 1 }}>
                                    <Skeleton height={20} width="70%" />
                                    <Skeleton height={16} width="40%" />
                                </Stack>
                                <Skeleton height={24} width={80} radius="xl" />
                                <Skeleton height={32} width={32} radius="sm" />
                            </div>
                        ))}
                    </Stack>
                </Paper>

                {/* Pagination Skeleton */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton height={36} width={300} radius="sm" />
                </div>
            </Stack>
        </Container>
    );
}
