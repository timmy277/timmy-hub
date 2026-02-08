'use client';

import { Title, Text, Button, Container, Group, Stack, Box } from '@mantine/core';
import { IconLockOff } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <Container py={80}>
            <Box pos="relative">
                <Stack align="center" gap="lg">
                    <IconLockOff
                        size={120}
                        stroke={1.5}
                        color="var(--mantine-color-red-6)"
                    />

                    <Title
                        order={1}
                        fw={900}
                        ta="center"
                        fz={{ base: 26, sm: 34 }}
                        style={{ fontFamily: 'Greycliff CF, var(--mantine-font-family)' }}
                    >
                        403 - Truy cập bị từ chối
                    </Title>

                    <Text
                        c="dimmed"
                        size="lg"
                        ta="center"
                        maw={500}
                        mx="auto"
                    >
                        Bạn không có quyền truy cập vào trang này. Nếu bạn tin rằng đây là một sự nhầm lẫn,
                        vui lòng liên hệ với quản trị viên hệ thống.
                    </Text>

                    <Group justify="center" mt="md">
                        <Button variant="light" size="md" onClick={() => router.back()}>
                            Quay lại trang trước
                        </Button>
                        <Button size="md" onClick={() => router.push('/')}>
                            Về trang chủ
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Container>
    );
}
