'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, Text, Group, Box, Button } from '@mantine/core';
import Link from 'next/link';
import type { Post } from '@/types/post';

interface Props {
    post: Post;
    isActive: boolean;
    videoRect: { left: number; width: number } | null;
    onMeasure: (rect: { left: number; width: number }) => void;
}

export function PostMediaPlayer({ post, isActive, videoRect, onMeasure }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isActive) void video.play().catch(() => { });
        else { video.pause(); video.currentTime = 0; }
    }, [isActive]);

    useEffect(() => {
        const measure = () => {
            const el = videoRef.current ?? wrapRef.current?.querySelector('img');
            const container = wrapRef.current;
            if (!el || !container) return;
            const cW = container.clientWidth;
            const cH = container.clientHeight;
            let natW = 0, natH = 0;
            if (el instanceof HTMLVideoElement) { natW = el.videoWidth || 9; natH = el.videoHeight || 16; }
            else { natW = (el as HTMLImageElement).naturalWidth || 9; natH = (el as HTMLImageElement).naturalHeight || 16; }
            const scale = Math.min(cW / natW, cH / natH);
            const renderedW = natW * scale;
            onMeasure({ left: (cW - renderedW) / 2, width: renderedW });
        };

        measure();
        window.addEventListener('resize', measure);
        const v = videoRef.current;
        if (v) { v.addEventListener('loadedmetadata', measure); v.addEventListener('loadeddata', measure); }
        return () => {
            window.removeEventListener('resize', measure);
            if (v) { v.removeEventListener('loadedmetadata', measure); v.removeEventListener('loadeddata', measure); }
        };
    }, [post.videoUrl, post.images, onMeasure]);

    const shopName = post.seller.sellerProfile?.shopName ?? post.seller.profile?.displayName ?? 'Shop';
    const shopSlug = post.seller.sellerProfile?.shopSlug;
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;

    return (
        <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
            {post.videoUrl ? (
                <video ref={videoRef} src={`${post.videoUrl}#t=0.001`}
                    poster={post.thumbnailUrl ?? undefined} loop muted playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            ) : post.images[0] ? (
                <Image src={post.images[0]} alt={post.title} fill
                    style={{ objectFit: 'contain' }} sizes="100vw" priority={isActive}
                    onLoad={() => window.dispatchEvent(new Event('resize'))} />
            ) : null}

            {/* Seller info overlay — bottom left of video content */}
            <Box pos="absolute" bottom={24}
                style={{
                    left: videoRect ? videoRect.left + 16 : 16,
                    right: videoRect ? `calc(100% - ${videoRect.left + videoRect.width - 16}px)` : 80,
                }}>
                <Group gap="xs" mb={6} align="center">
                    <Avatar src={avatar} size={32} radius="xl">{shopName[0]}</Avatar>
                    {shopSlug ? (
                        <Link href={`/shop/${shopSlug}`} style={{ textDecoration: 'none' }}>
                            <Text fw={700} size="sm" c="white">{shopName}</Text>
                        </Link>
                    ) : <Text fw={700} size="sm" c="white">{shopName}</Text>}
                    <Button size="xs" variant="outline" radius="xl"
                        style={{ borderColor: 'rgba(255,255,255,0.8)', color: 'white', height: 24, padding: '0 10px', fontSize: 11 }}>
                        Theo dõi
                    </Button>
                </Group>
                <Text size="sm" c="white" lineClamp={2} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {post.title}
                </Text>
                {post.hashtags.length > 0 && (
                    <Group gap={4} mt={4}>
                        {post.hashtags.slice(0, 4).map(tag => (
                            <Text key={tag} size="xs" c="blue.3">#{tag}</Text>
                        ))}
                    </Group>
                )}
            </Box>

            {/* Bottom gradient — only over video area */}
            <div style={{
                display: 'none',
            }} />
        </div>
    );
}
