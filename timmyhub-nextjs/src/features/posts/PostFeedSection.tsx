'use client';

import { Title, Text, Group, Box, ThemeIcon, Skeleton, Anchor } from '@mantine/core';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { PostCard } from './components/PostCard';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';

export function PostFeedSection() {
    const { data, isLoading } = useInfiniteQuery({
        queryKey: ['posts-feed-home'],
        queryFn: ({ pageParam }) =>
            postService.getFeed({ cursor: pageParam as string | undefined, limit: 10 }),
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

            <Swiper
                modules={[FreeMode]}
                freeMode
                slidesPerView={6}
                spaceBetween={10}
                grabCursor
                style={{ paddingBottom: 4 }}
            >
                {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <SwiperSlide key={i}>
                            <Skeleton style={{ aspectRatio: '3/4', borderRadius: 2 }} />
                        </SwiperSlide>
                    ))
                    : posts.map(post => (
                        <SwiperSlide key={post.id}>
                            <PostCard post={post} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </Box>
    );
}
