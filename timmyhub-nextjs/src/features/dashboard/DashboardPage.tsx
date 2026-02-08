import {
    Container,
    Title,
    Text,
    Stack,
    Card,
    Group,
    Badge,
    Button,
} from '@mantine/core';
import { DashboardShell } from '@/components/layout';

export function DashboardPage() {
    return (
        <DashboardShell>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    <Stack gap="xs">
                        <Title order={1}>
                            Hệ thống quản trị TimmyHub
                        </Title>
                        <Text size="lg" c="dimmed">
                            Đây là khu vực Dashboard với đầy đủ Sidebar và Appbar điều hướng.
                        </Text>
                    </Stack>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Text fw={500}>Thống kê tổng quan</Text>
                                <Badge color="green" variant="light">
                                    Đang hoạt động
                                </Badge>
                            </Group>

                            <Text size="sm" c="dimmed">
                                Trang này sử dụng DashboardShell để cung cấp trải nghiệm quản trị đầy đủ.
                                Bạn có thể đóng/mở Sidebar bằng nút trên AppBar.
                            </Text>

                            <Group gap="sm">
                                <Button variant="filled">
                                    Tải báo cáo
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </DashboardShell>
    );
}
