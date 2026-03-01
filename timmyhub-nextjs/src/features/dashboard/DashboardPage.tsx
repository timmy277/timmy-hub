'use client';

import { Title, Text, Container, Paper, Stack } from '@mantine/core';

/**
 * Trang Dashboard tổng quan cho Admin
 * Layout (AppBar + Sidebar) được cung cấp bởi AdminLayout ở cấp route
 */
export function DashboardPage() {
    return (
        <Container fluid p="md">
            <Paper withBorder p="xl" radius="md" shadow="sm">
                <Stack gap="xs">
                    <Title order={2}>Admin Panel</Title>
                    <Text c="dimmed">Chào mừng bạn đến với hệ thống quản trị TimmyHub.</Text>
                </Stack>
            </Paper>
        </Container>
    );
}
