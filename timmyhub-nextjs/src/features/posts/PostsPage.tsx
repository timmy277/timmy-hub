'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { PostFeedItem } from './components/PostFeedItem';
import { Center, Loader } from '@mantine/core';
import type { Post } from '@/types/post';

export function PostsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['posts-feed'],
        queryFn: ({ pageParam }) =>
            postService.getFeed({ cursor: pageParam as string | undefined, limit: 5 }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: p => p.nextCursor ?? undefined,
        staleTime: 60_000,
    });

    const posts: Post[] = data?.pages.flatMap(p => p.data) ?? [];

    useEffect(() => {
        if (activeIndex >= posts.length - 2 && hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [activeIndex, posts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const items = container.querySelectorAll('[data-post-item]');
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = Number((entry.target as HTMLElement).dataset.postIndex);
                        setActiveIndex(idx);
                    }
                });
            },
            { root: container, threshold: 0.6 },
        );
        items.forEach(item => observer.observe(item));
        return () => observer.disconnect();
    }, [posts.length]);

    const scrollToIndex = useCallback((idx: number) => {
        const container = containerRef.current;
        if (!container) return;
        const item = container.querySelector(`[data-post-index="${idx}"]`) as HTMLElement;
        item?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') scrollToIndex(Math.min(activeIndex + 1, posts.length - 1));
            if (e.key === 'ArrowUp') scrollToIndex(Math.max(activeIndex - 1, 0));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [activeIndex, posts.length, scrollToIndex]);

    return (
        <div
            ref={containerRef}
            style={{
                height: 'calc(100dvh - 60px)',
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                scrollbarWidth: 'none',
            }}
        >
            {isLoading ? (
                <Center h="100dvh"><Loader size="lg" /></Center>
            ) : (
                <>
                    {posts.map((post, i) => (
                        <div key={post.id} data-post-item data-post-index={i}
                            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', height: 'calc(100dvh - 60px)' }}>
                            <PostFeedItem post={post} isActive={activeIndex === i} />
                        </div>
                    ))}
                    {isFetchingNextPage && <Center h="100dvh"><Loader size="md" /></Center>}
                </>
            )}
        </div>
    );
}
