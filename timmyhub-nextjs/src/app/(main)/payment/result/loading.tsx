import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function Loading() {
    return (
        <Container size="sm" py="xl">
            <Paper p="xl" radius="md" withBorder>
                <Stack gap="lg" align="center">
                    <Skeleton height={80} width={80} radius="xl" />
                    <Skeleton height={36} width={250} />
                    <Skeleton height={20} width={300} />

                    <Stack gap="sm" style={{ width: '100%' }} mt="md">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Skeleton height={20} width={150} />
                                <Skeleton height={20} width={120} />
                            </div>
                        ))}
                    </Stack>

                    <Skeleton height={48} width="100%" radius="md" mt="lg" />
                </Stack>
            </Paper>
        </Container>
    );
}
