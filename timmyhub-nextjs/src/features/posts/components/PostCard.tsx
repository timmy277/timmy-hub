'use client';

import { useRouter } from 'next/navigation';
import { Box, Image } from '@mantine/core';
import type { Post } from '@/types/post';

interface PostCardProps {
    post: Post;
    onOpenDetail?: (post: Post) => void;
}

export function PostCard({ post, onOpenDetail }: PostCardProps) {
    const router = useRouter();

    const hasVideo = !!post.videoUrl;

    const handleClick = () => {
        if (onOpenDetail) onOpenDetail(post);
        else router.push(`/posts?id=${post.id}`);
    };

    return (
        <Box
            onClick={handleClick}
            style={{
                position: 'relative',
                aspectRatio: '3/4',
                borderRadius: 'var(--mantine-radius-md)',
                overflow: 'hidden',
                background: '#111',
                cursor: 'pointer',
            }}
        >
            {hasVideo ? (
                <video
                    src={`${post.videoUrl}#t=0.001`}
                    preload="metadata"
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                />
            ) : post.images[0] ? (
                <Image
                    src={post.images[0]}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            ) : null}
        </Box>
    );
}
