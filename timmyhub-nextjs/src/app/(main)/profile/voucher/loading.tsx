import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                <Skeleton height={32} width={200} />

                {/* Filter Tabs Skeleton */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height={36} width={100} radius="xl" />
                    ))}
                </div>

                {/* Vouchers List Skeleton */}
                <Stack gap="md">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Paper key={i} p="md" radius="md" withBorder>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Skeleton height={80} width={80} radius="md" />
                                <Stack gap="xs" style={{ flex: 1 }}>
                                    <Skeleton height={24} width="60%" />
                                    <Skeleton height={16} width="80%" />
                                    <Skeleton height={16} width="40%" />
                                </Stack>
                                <Skeleton height={36} width={100} radius="md" />
                            </div>
                        </Paper>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
}
