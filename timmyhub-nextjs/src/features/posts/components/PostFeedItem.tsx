'use client';

import { useState, useCallback } from 'react';
import { ActionIcon } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useMutation } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { useRouter } from 'next/navigation';
import type { Post } from '@/types/post';
import { PostMediaPlayer } from './PostMediaPlayer';
import { PostActionBar } from './PostActionBar';
import { PostCommentPanel } from './PostCommentPanel';

const H = 'calc(100dvh - 60px)';

interface Props { post: Post; isActive: boolean; }

export function PostFeedItem({ post, isActive }: Props) {
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [showComments, setShowComments] = useState(false);
    const [videoRect, setVideoRect] = useState<{ left: number; width: number } | null>(null);

    const likeMutation = useMutation({
        mutationFn: () => postService.toggleLike(post.id),
        onMutate: () => { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); },
        onError: () => { setLiked(p => !p); setLikeCount(post.likeCount); },
    });

    const handleMeasure = useCallback((rect: { left: number; width: number }) => {
        setVideoRect(rect);
    }, []);

    const iconsLeft = videoRect ? videoRect.left + videoRect.width + 12 : undefined;

    return (
        <div style={{ position: 'relative', width: '100%', height: H, background: '#000', overflow: 'hidden' }}>
            <PostMediaPlayer post={post} isActive={isActive} videoRect={videoRect} onMeasure={handleMeasure} />

            {/* Back button */}
            <ActionIcon pos="absolute" top={16} left={16} size={40} radius="xl" variant="filled"
                style={{ background: 'rgba(0,0,0,0.5)', zIndex: 10 }}
                onClick={() => router.back()}>
                <Iconify icon="solar:arrow-left-linear" width={22} />
            </ActionIcon>

            <PostActionBar
                liked={liked}
                likeCount={likeCount}
                commentCount={post.commentCount}
                showComments={showComments}
                onLike={() => likeMutation.mutate()}
                onToggleComments={() => setShowComments(p => !p)}
                style={iconsLeft !== undefined ? { left: iconsLeft } : { right: 12 }}
            />

            <PostCommentPanel
                post={post}
                open={showComments}
                onClose={() => setShowComments(false)}
            />
        </div>
    );
}
