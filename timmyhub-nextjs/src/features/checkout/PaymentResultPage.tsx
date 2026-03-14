'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
    Container,
    Title,
    Text,
    Paper,
    Button,
    Group,
    Stack,
    ThemeIcon,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success') === 'true';
    const orderId = searchParams.get('orderId') ?? '';
    const message =
        searchParams.get('message') ?? (success ? 'Thanh toán thành công' : 'Thanh toán thất bại');

    return (
        <Container size="sm" py="xl">
            <Paper p="xl" withBorder ta="center">
                <Stack align="center" gap="md">
                    <ThemeIcon
                        size={64}
                        radius="xl"
                        color={success ? 'green' : 'red'}
                        variant="light"
                    >
                        {success ? (
                            <Iconify icon="tabler:circle-check" width={40} stroke={2} />
                        ) : (
                            <Iconify icon="tabler:circle-x" width={40} stroke={2} />
                        )}
                    </ThemeIcon>
                    <Title order={2}>
                        {success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                    </Title>
                    <Text c="dimmed">{message}</Text>
                    {orderId && success && (
                        <Text size="sm">
                            Mã đơn hàng: <Text span fw={600}>{orderId}</Text>
                        </Text>
                    )}
                    <Group justify="center" mt="md">
                        {orderId && (
                            <Button component={Link} href={`/profile/orders/${orderId}`} variant="light">
                                Xem đơn hàng
                            </Button>
                        )}
                        <Button component={Link} href="/">
                            Về trang chủ
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        </Container>
    );
}

export function PaymentResultPage() {
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
            <PaymentResultContent />
        </Suspense>
    );
}
