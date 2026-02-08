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
import { MainShell } from '@/components/layout';
import Link from 'next/link';

export function HomePage() {
    return (
        <MainShell>
            <Container size="md" py="xl">
                <Stack gap="xl">
                    <Stack gap="xs">
                        <Title order={1}>
                            Chào mừng tới TimmyHub
                        </Title>
                        <Text size="lg" c="dimmed">
                            Đây là trang chủ với bố cục tối giản, không có Sidebar.
                        </Text>
                    </Stack>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Text fw={500}>Landing Page Experience</Text>
                                <Badge color="blue" variant="light">
                                    Minimalist
                                </Badge>
                            </Group>

                            <Text size="sm" c="dimmed">
                                Bố cục này tập trung vào nội dung chính, phù hợp cho trang giới thiệu hoặc trang đích.
                                Nút mở Sidebar đã được loại bỏ để giữ sự tập trung.
                            </Text>

                            <Group gap="sm">
                                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                                    <Button variant="filled">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </Group>
                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </MainShell>
    );
}
