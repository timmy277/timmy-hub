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
import { usePostStore } from '@/stores/usePostStore';

const H = 'calc(100dvh - 60px)';

interface Props { post: Post; isActive: boolean; }

export function PostFeedItem({ post, isActive }: Props) {
    const router = useRouter();
    const { muted, toggleMute } = usePostStore();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [showComments, setShowComments] = useState(false);
    const [playing, setPlaying] = useState(true);
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
            <PostMediaPlayer post={post} isActive={isActive} videoRect={videoRect}
                muted={muted} playing={playing}
                onMeasure={handleMeasure}
                onTogglePlay={() => setPlaying(p => !p)}
            />

            <PostActionBar
                liked={liked}
                likeCount={likeCount}
                commentCount={post.commentCount}
                showComments={showComments}
                muted={muted}
                onLike={() => likeMutation.mutate()}
                onToggleComments={() => setShowComments(p => !p)}
                onToggleMute={toggleMute}
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
