import { Suspense } from 'react';
import { PaymentResultPage } from '@/features/checkout/PaymentResultPage';
import { Container, Paper, Text } from '@mantine/core';

export default function Page() {
    return (
        <Suspense
            fallback={
                <Container size="sm" py="xl">
                    <Paper p="xl" withBorder ta="center">
                        <Text c="dimmed">Đang tải...</Text>
                    </Paper>
                </Container>
            }
        >
            <PaymentResultPage />
        </Suspense>
    );
}
