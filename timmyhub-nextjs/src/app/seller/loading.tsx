import { Container, SimpleGrid, Stack, Skeleton, Paper } from '@mantine/core';

export default function SellerDashboardLoading() {
    return (
        <Container fluid p="md">
            <Stack gap="xl">
                {/* Header skeleton */}
                <Skeleton h={40} w={300} />

                {/* Stat cards skeleton */}
                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                    {[1, 2, 3, 4].map((i) => (
                        <Paper key={i} withBorder p="lg">
                            <Skeleton h={100} />
                        </Paper>
                    ))}
                </SimpleGrid>

                {/* Charts skeleton */}
                <Paper withBorder p="lg">
                    <Skeleton h={300} />
                </Paper>

                {/* Tables skeleton */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Paper withBorder p="lg">
                        <Skeleton h={250} />
                    </Paper>
                    <Paper withBorder p="lg">
                        <Skeleton h={250} />
                    </Paper>
                </SimpleGrid>
            </Stack>
        </Container>
    );
}
