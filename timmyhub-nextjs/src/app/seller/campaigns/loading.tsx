import { Container, Stack, Skeleton, Paper } from '@mantine/core';

export default function SellerCampaignsLoading() {
    return (
        <Container fluid p="md">
            <Stack gap="md">
                <Skeleton height={40} width={300} />
                <Skeleton height={50} width="100%" />

                <Paper withBorder>
                    <Stack gap={0}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ borderBottom: '1px solid var(--mantine-color-default-border)', padding: '12px' }}>
                                <Skeleton height={60} />
                            </div>
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
