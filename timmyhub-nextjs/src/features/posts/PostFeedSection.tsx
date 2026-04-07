'use client';

import { Title, Text, Group, Box, ThemeIcon, SimpleGrid, Skeleton, Anchor } from '@mantine/core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { PostCard } from './components/PostCard';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';

export function PostFeedSection() {
    const { data, isLoading } = useInfiniteQuery({
        queryKey: ['posts-feed-home'],
        queryFn: ({ pageParam }) =>
            postService.getFeed({ cursor: pageParam as string | undefined, limit: 5 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: () => undefined,
        staleTime: 60_000,
    });

    const posts = data?.pages[0]?.data ?? [];

    return (
        <Box>
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'pink', to: 'violet' }}>
                        <Iconify icon="solar:video-frame-bold" width={18} />
                    </ThemeIcon>
                    <Box>
                        <Title order={3}>Video & Bài đăng</Title>
                        <Text size="xs" c="dimmed">Khám phá sản phẩm qua video từ các shop</Text>
                    </Box>
                </Group>
                <Anchor component={Link} href="/posts" size="sm" fw={500}>
                    Xem tất cả →
                </Anchor>
            </Group>

            <SimpleGrid cols={5} spacing="sm">
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} style={{ aspectRatio: '9/16' }} radius="md" />
                    ))
                    : posts.slice(0, 5).map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                }
            </SimpleGrid>
        </Box>
    );
}
