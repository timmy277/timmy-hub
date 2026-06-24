import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function SellerProductsLoading() {
    return (
        <Container fluid p="md">
            <Stack gap="md">
                {/* Header + actions skeleton */}
                <Skeleton h={40} w={300} />
                <Skeleton h={50} w="100%" />

                {/* Products table skeleton */}
                <Paper withBorder>
                    <Stack gap={0}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--mantine-color-default-border)', padding: '12px' }}>
                                <Skeleton h={60} />
                            </div>
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
