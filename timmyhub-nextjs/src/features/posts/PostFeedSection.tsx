'use client';

import { useState } from 'react';
import { Title, Text, Group, Box, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PostFeed } from './components/PostFeed';
import { PostDetailModal } from './components/PostDetailModal';
import Iconify from '@/components/iconify/Iconify';
import type { Post } from '@/types/post';

export function PostFeedSection() {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    const handleOpenDetail = (post: Post) => {
        setSelectedPost(post);
        openDetail();
    };

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

            <PostFeed onOpenDetail={handleOpenDetail} />

            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    opened={detailOpened}
                    onClose={closeDetail}
                />
            )}
        </Box>
    );
}
