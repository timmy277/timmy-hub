import { Container, SimpleGrid, Stack, Skeleton, Paper } from '@mantine/core';

export default function AdminDashboardLoading() {
    return (
        <Container fluid p="md">
            <Stack gap="xl">
                <Skeleton height={40} width={300} />

                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Paper key={i} withBorder p="lg">
                            <Skeleton height={100} />
                        </Paper>
                    ))}
                </SimpleGrid>

                <Paper withBorder p="lg">
                    <Skeleton height={300} />
                </Paper>
            </Stack>
        </Container>
    );
}
