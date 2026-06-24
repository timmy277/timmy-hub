import { Container, Stack, Skeleton, Paper, SimpleGrid } from '@mantine/core';

export default function ProfileLoading() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Header skeleton */}
                <Paper p="xl" withBorder>
                    <Stack gap="md" align="center">
                        <Skeleton h={120} w={120} circle />
                        <Skeleton h={30} w={200} />
                        <Skeleton h={20} w={150} />
                    </Stack>
                </Paper>

                {/* Info cards skeleton */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {[1, 2, 3, 4].map((i) => (
                        <Paper key={i} p="md" withBorder>
                            <Skeleton h={80} />
                        </Paper>
                    ))}
                </SimpleGrid>
            </Stack>
        </Container>
    );
}
