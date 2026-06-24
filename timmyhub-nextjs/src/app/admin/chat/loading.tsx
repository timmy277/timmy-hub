import { Container, SimpleGrid, Stack, Skeleton, Paper } from '@mantine/core';

export default function AdminChatLoading() {
    return (
        <Container fluid p="md">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Paper withBorder p="md">
                    <Stack gap="sm">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} height={60} />
                        ))}
                    </Stack>
                </Paper>

                <div style={{ gridColumn: 'span 2' }}>
                    <Paper withBorder p="md" style={{ height: '600px' }}>
                        <Skeleton height="100%" />
                    </Paper>
                </div>
            </SimpleGrid>
        </Container>
    );
}
