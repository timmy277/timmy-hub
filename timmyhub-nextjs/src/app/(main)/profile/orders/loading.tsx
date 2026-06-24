import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function OrdersLoading() {
    return (
        <Container size="xl" py="xl">
            <Stack gap="md">
                <Skeleton h={40} w={200} />

                {/* Orders list skeleton */}
                {[1, 2, 3, 4].map((i) => (
                    <Paper key={i} p="md" withBorder>
                        <Stack gap="sm">
                            <Skeleton h={30} w="40%" />
                            <Skeleton h={60} />
                            <Skeleton h={40} w="30%" />
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}
