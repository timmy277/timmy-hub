'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { PostCard } from './PostCard';
import { VirtualGrid } from '@/components/common/VirtualGrid';
import type { Post } from '@/types/post';

const LIMIT = 12;

interface PostFeedProps {
    sellerId?: string;
    hashtag?: string;
    onOpenDetail?: (post: Post) => void;
}

export function PostFeed({ sellerId, hashtag, onOpenDetail }: PostFeedProps) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['posts-feed', sellerId, hashtag],
        queryFn: ({ pageParam }) =>
            postService.getFeed({ cursor: pageParam as string | undefined, limit: LIMIT, sellerId, hashtag }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: p => p.nextCursor ?? undefined,
        staleTime: 60_000,
    });

    const allPosts = data?.pages.flatMap(p => p.data) ?? [];

    return (
        <VirtualGrid
            items={allPosts}
            renderItem={(post) => (
                <PostCard post={post} onOpenDetail={onOpenDetail} />
            )}
            columns={{ base: 2, sm: 3, md: 4 }}
            estimateRowHeight={480}
            maxHeight="80vh"
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoadingMore={isFetchingNextPage}
            isLoading={isLoading}
            emptyText="Chưa có bài đăng nào"
        />
    );
}
