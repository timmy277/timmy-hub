import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function AdminDistrictsLoading() {
    return (
        <Container fluid p="md">
            <Stack gap="md">
                <Skeleton height={40} width={200} />
                <Skeleton height={50} width="100%" />

                <Paper withBorder>
                    <Stack gap={0}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--mantine-color-default-border)', padding: '12px' }}>
                                <Skeleton height={50} />
                            </div>
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
