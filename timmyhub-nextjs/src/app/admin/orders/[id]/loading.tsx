import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="xl" py="md">
            <Stack gap="lg">
                {/* Header with Actions Skeleton */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack gap="xs">
                        <Skeleton height={32} width={250} />
                        <Skeleton height={20} width={200} />
                    </Stack>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Skeleton height={36} width={120} radius="md" />
                        <Skeleton height={36} width={120} radius="md" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Order Details Skeleton */}
                    <Stack gap="md">
                        {/* Order Items */}
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

                        {/* Shipping Address */}
                        <Paper p="md" radius="md" withBorder>
                            <Stack gap="sm">
                                <Skeleton height={24} width={150} />
                                <Skeleton height={16} width="80%" />
                                <Skeleton height={16} width="60%" />
                                <Skeleton height={16} width="70%" />
                            </Stack>
                        </Paper>
                    </Stack>

                    {/* Order Summary Sidebar Skeleton */}
                    <Stack gap="md">
                        <Paper p="md" radius="md" withBorder>
                            <Stack gap="sm">
                                <Skeleton height={24} width={120} />
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Skeleton height={16} width={100} />
                                        <Skeleton height={16} width={80} />
                                    </div>
                                ))}
                            </Stack>
                        </Paper>

                        <Paper p="md" radius="md" withBorder>
                            <Stack gap="sm">
                                <Skeleton height={20} width={100} />
                                <Skeleton height={36} radius="xl" />
                            </Stack>
                        </Paper>
                    </Stack>
                </div>
            </Stack>
        </Container>
    );
}
