import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                {/* Header Skeleton */}
                <Stack gap="sm" align="center">
                    <Skeleton height={40} width={300} />
                    <Skeleton height={20} width={400} />
                </Stack>

                {/* Form Skeleton */}
                <Paper p="xl" radius="md" withBorder>
                    <Stack gap="md">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton height={16} width={120} mb="xs" />
                                <Skeleton height={40} radius="sm" />
                            </div>
                        ))}
                        <Skeleton height={48} radius="sm" mt="lg" />
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
