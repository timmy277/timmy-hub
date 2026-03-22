'use client';

import { Container, Title, Group, Text, Stack } from '@mantine/core';
import { DashboardClient } from './components/DashboardClient';

export function DashboardPage(): React.ReactElement {
    return (
        <Container fluid p="md">
            <Group justify="space-between" align="center" mb="xl">
                <Stack gap={4}>
                    <Title order={2} className="text-xl font-bold">
                        Dashboard
                    </Title>
                    <Text c="dimmed" size="sm">
                        Tổng quan hệ thống TimmyHub
                    </Text>
                </Stack>
            </Group>
            <DashboardClient />
        </Container>
    );
}
