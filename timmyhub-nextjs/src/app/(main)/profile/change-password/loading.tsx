import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="sm" py="md">
            <Paper p="xl" radius="md" withBorder>
                <Stack gap="lg">
                    <Skeleton height={32} width={200} />

                    {/* Password Fields Skeleton */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton height={16} width={150} mb="xs" />
                            <Skeleton height={40} radius="sm" />
                        </div>
                    ))}

                    <Skeleton height={48} radius="md" mt="md" />
                </Stack>
            </Paper>
        </Container>
    );
}
