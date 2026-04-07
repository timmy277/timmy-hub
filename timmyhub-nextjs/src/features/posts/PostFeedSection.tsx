'use client';

import { Title, Text, Group, Box, ThemeIcon } from '@mantine/core';
import { PostFeed } from './components/PostFeed';
import Iconify from '@/components/iconify/Iconify';

export function PostFeedSection() {
    return (
        <Box>
            <Group gap="xs" mb="md">
                <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'pink', to: 'violet' }}>
                    <Iconify icon="solar:video-frame-bold" width={18} />
                </ThemeIcon>
                <Box>
                    <Title order={3}>Video & Bài đăng</Title>
                    <Text size="xs" c="dimmed">Khám phá sản phẩm qua video từ các shop</Text>
                </Box>
            </Group>

            {/* PostFeed không truyền onOpenDetail → PostCard tự navigate /posts */}
            <PostFeed />
        </Box>
    );
}
