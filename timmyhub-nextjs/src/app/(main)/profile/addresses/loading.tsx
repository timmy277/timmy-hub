import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function AddressesLoading() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="md">
                <Skeleton h={40} w={200} />

                {/* Addresses list skeleton */}
                {[1, 2, 3].map((i) => (
                    <Paper key={i} p="md" withBorder>
                        <Stack gap="sm">
                            <Skeleton h={30} w="60%" />
                            <Skeleton h={60} />
                            <Skeleton h={40} w="40%" />
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}
