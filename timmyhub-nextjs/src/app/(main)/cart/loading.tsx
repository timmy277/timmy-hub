import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function CartLoading() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Header skeleton */}
                <Skeleton h={40} w={200} />

                {/* Cart items skeleton */}
                <Stack gap="md">
                    {[1, 2, 3].map((i) => (
                        <Paper key={i} p="md" withBorder>
                            <Stack gap="sm">
                                <Skeleton h={80} />
                                <Skeleton h={30} w="60%" />
                            </Stack>
                        </Paper>
                    ))}
                </Stack>

                {/* Summary skeleton */}
                <Paper p="md" withBorder>
                    <Skeleton h={120} />
                </Paper>
            </Stack>
        </Container>
    );
}
