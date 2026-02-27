'use client';

import { Container, Title, Text, Paper } from '@mantine/core';

export default function SellerVouchersPage() {
    return (
        <Container fluid p="md">
            <Title order={2} mb="xs">
                Voucher
            </Title>
            <Text c="dimmed" size="sm" mb="md">
                Quản lý mã giảm giá của gian hàng. Gọi API GET /vouchers (seller) để hiển thị danh sách.
            </Text>
            <Paper withBorder p="xl" radius="md">
                <Text size="sm" c="dimmed">
                    Trang danh sách voucher sẽ được tích hợp với API /vouchers (Seller) trong bước tiếp theo.
                </Text>
            </Paper>
        </Container>
    );
}
