import { Container, SimpleGrid, Stack, Skeleton, Paper } from '@mantine/core';

export default function CheckoutLoading() {
    return (
        <Container size="xl" py="xl">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                {/* Form skeleton */}
                <Stack gap="md">
                    <Skeleton h={40} w={200} />
                    <Paper p="md" withBorder>
                        <Stack gap="sm">
                            <Skeleton h={60} />
                            <Skeleton h={60} />
                            <Skeleton h={120} />
                        </Stack>
                    </Paper>
                </Stack>

                {/* Summary skeleton */}
                <Stack gap="md">
                    <Skeleton h={40} w={200} />
                    <Paper p="md" withBorder>
                        <Stack gap="sm">
                            <Skeleton h={80} />
                            <Skeleton h={80} />
                            <Skeleton h={40} />
                        </Stack>
                    </Paper>
                </Stack>
            </SimpleGrid>
        </Container>
    );
}
