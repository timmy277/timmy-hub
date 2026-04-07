'use client';

import { useRef, useState, useEffect } from 'react';
import { Avatar, Text, Group, ActionIcon, Stack, Box, Button } from '@mantine/core';
import Image from 'next/image';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import type { Post } from '@/types/post';
import { useRouter } from 'next/navigation';

interface Props { post: Post; isActive: boolean; }

const H = 'calc(100dvh - 60px)';

export function PostFeedItem({ post, isActive }: Props) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    // Track actual video rendered width to position icons right next to it
    const [videoRect, setVideoRect] = useState<{ left: number; width: number } | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isActive) void video.play().catch(() => { });
        else { video.pause(); video.currentTime = 0; }
    }, [isActive]);

    // Calculate actual rendered video bounds (object-contain leaves black bars)
    useEffect(() => {
        const measure = () => {
            const el = videoRef.current ?? containerRef.current?.querySelector('img');
            const container = containerRef.current;
            if (!el || !container) return;

            const cW = container.clientWidth;
            const cH = container.clientHeight;

            // Get natural aspect ratio
            let natW = 0, natH = 0;
            if (el instanceof HTMLVideoElement) {
                natW = el.videoWidth || 9;
                natH = el.videoHeight || 16;
            } else {
                natW = (el as HTMLImageElement).naturalWidth || 9;
                natH = (el as HTMLImageElement).naturalHeight || 16;
            }

            const scale = Math.min(cW / natW, cH / natH);
            const renderedW = natW * scale;
            const renderedLeft = (cW - renderedW) / 2;
            setVideoRect({ left: renderedLeft, width: renderedW });
        };

        measure();
        window.addEventListener('resize', measure);
        const v = videoRef.current;
        if (v) {
            v.addEventListener('loadedmetadata', measure);
            v.addEventListener('loadeddata', measure);
        }
        return () => {
            window.removeEventListener('resize', measure);
            if (v) {
                v.removeEventListener('loadedmetadata', measure);
                v.removeEventListener('loadeddata', measure);
            }
        };
    }, [post.videoUrl, post.images]);

    const likeMutation = useMutation({
        mutationFn: () => postService.toggleLike(post.id),
        onMutate: () => { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); },
        onError: () => { setLiked(p => !p); setLikeCount(post.likeCount); },
    });

    const shopName = post.seller.sellerProfile?.shopName ?? post.seller.profile?.displayName ?? 'Shop';
    const shopSlug = post.seller.sellerProfile?.shopSlug;
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;
    const fmtCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

    // Icons sit right of the video content area
    const iconsLeft = videoRect ? videoRect.left + videoRect.width + 12 : undefined;
    // User info sits inside video, bottom-left
    const infoLeft = videoRect ? videoRect.left + 16 : 16;
    const infoRight = videoRect ? `calc(100% - ${videoRect.left + videoRect.width - 16}px)` : 80;

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width: '100%', height: H, background: '#000', overflow: 'hidden' }}
        >
            {/* Media */}
            {post.videoUrl ? (
                <video ref={videoRef} src={`${post.videoUrl}#t=0.001`}
                    poster={post.thumbnailUrl ?? undefined}
                    loop muted playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            ) : post.images[0] ? (
                <Image src={post.images[0]} alt={post.title} fill
                    style={{ objectFit: 'contain' }} sizes="100vw" priority={isActive}
                    onLoad={() => {
                        // trigger re-measure after image loads
                        window.dispatchEvent(new Event('resize'));
                    }}
                />
            ) : null}

            {/* Back button */}
            <ActionIcon
                pos="absolute" top={16} left={16}
                size={40} radius="xl" variant="filled"
                style={{ background: 'rgba(0,0,0,0.5)', zIndex: 10 }}
                onClick={() => router.back()}
            >
                <Iconify icon="solar:arrow-left-linear" width={22} />
            </ActionIcon>

            {/* Gradient only over the video area */}
            {videoRect && (
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0,
                    left: videoRect.left,
                    width: videoRect.width,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 45%)',
                    pointerEvents: 'none',
                }} />
            )}

            {/* User info — bottom-left of video */}
            <Box pos="absolute" bottom={24} style={{ left: infoLeft, right: infoRight }}>
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

            {/* Action icons — right side of video content */}
            <Stack
                gap="lg"
                pos="absolute"
                bottom={80}
                align="center"
                style={{ left: iconsLeft ?? 'auto', right: iconsLeft === undefined ? 12 : 'auto' }}
            >
                <Stack gap={2} align="center">
                    <ActionIcon size={44} radius="xl" variant="filled"
                        color={liked ? 'red' : undefined}
                        style={{ background: liked ? undefined : 'rgba(60,60,60,0.85)' }}
                        onClick={() => likeMutation.mutate()}>
                        <Iconify icon={liked ? 'solar:heart-bold' : 'solar:heart-linear'} width={22} />
                    </ActionIcon>
                    <Text size="xs" c="white" fw={600}>{fmtCount(likeCount)}</Text>
                </Stack>

                <Stack gap={2} align="center">
                    <ActionIcon size={44} radius="xl" variant="filled"
                        style={{ background: 'rgba(60,60,60,0.85)' }}>
                        <Iconify icon="solar:chat-round-dots-bold" width={22} />
                    </ActionIcon>
                    <Text size="xs" c="white" fw={600}>{fmtCount(post.commentCount)}</Text>
                </Stack>

                <Stack gap={2} align="center">
                    <ActionIcon size={44} radius="xl" variant="filled"
                        style={{ background: 'rgba(60,60,60,0.85)' }}>
                        <Iconify icon="solar:share-bold" width={22} />
                    </ActionIcon>
                    <Text size="xs" c="white" fw={600}>Chia sẻ</Text>
                </Stack>
            </Stack>
        </div>
    );
}
