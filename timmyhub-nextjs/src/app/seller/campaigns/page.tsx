'use client';

import { Container, Title, Text, Paper } from '@mantine/core';

export default function SellerCampaignsPage() {
    return (
        <Container fluid p="md">
            <Title order={2} mb="xs">
                Chương trình khuyến mãi
            </Title>
            <Text c="dimmed" size="sm" mb="md">
                Tạo và quản lý campaign. Gọi API GET /promotion-campaigns (seller) để hiển thị danh sách.
            </Text>
            <Paper withBorder p="xl" radius="md">
                <Text size="sm" c="dimmed">
                    Trang danh sách campaign sẽ được tích hợp với API /promotion-campaigns trong bước tiếp theo.
                </Text>
            </Paper>
        </Container>
    );
}
