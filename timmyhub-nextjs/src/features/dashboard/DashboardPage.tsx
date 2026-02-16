'use client';

import { Title, Text, Container, Paper, Stack } from '@mantine/core';
import { DashboardShell } from '@/components/layout/DashboardShell';

/**
 * Trang Dashboard tổng quan cho Admin
 * Hiện tại chỉ hiển thị thông tin cơ bản theo yêu cầu của user
 */
export function DashboardPage() {
    return (
        <DashboardShell>
            <Container fluid p="md">
                <Paper withBorder p="xl" radius="md" shadow="sm">
                    <Stack gap="xs">
                        <Title order={2}>Admin Panel</Title>
                        <Text c="dimmed">Chào mừng bạn đến với hệ thống quản trị TimmyHub.</Text>
                    </Stack>
                </Paper>
            </Container>
        </DashboardShell>
    );
}
