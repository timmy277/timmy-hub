'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Avatar, Text, Group, Stack, ActionIcon, TextInput, ScrollArea } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { formatVND } from '@/utils/currency';
import { useAuth } from '@/hooks/useAuth';
import { RichTextContent } from '@/components/common/RichTextContent';
import type { Post, PostComment } from '@/types/post';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import Image from 'next/image';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface PostFullViewProps {
    post: Post;
    isActive: boolean;
}

export function PostFullView({ post, isActive }: PostFullViewProps) {
    const { user } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [comment, setComment] = useState('');
    const [realtimeComments, setRealtimeComments] = useState<PostComment[]>([]);

    // Auto play/pause khi active
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isActive) {
            void video.play().catch(() => { });
        } else {
            video.pause();
            video.currentTime = 0;
        }
    }, [isActive]);

    // Socket realtime comments
    useEffect(() => {
        if (!isActive) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }
        const socket = io(`${SOCKET_URL}/posts`, {
            auth: { token: Cookies.get('access_token') },
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
        socket.on('connect', () => socket.emit('post:join', post.id));
        socket.on('post:new_comment', (c: PostComment) => {
            setRealtimeComments(prev => prev.some(x => x.id === c.id) ? prev : [...prev, c]);
        });
        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [isActive, post.id]);

    const { data: commentsData } = useQuery({
        queryKey: ['post-comments', post.id],
        queryFn: () => postService.getComments(post.id),
        enabled: isActive,
        staleTime: 0,
    });

    const rawComments: PostComment[] = Array.isArray((commentsData as { data?: unknown })?.data)
        ? (commentsData as { data: PostComment[] }).data
        : Array.isArray(commentsData) ? (commentsData as unknown as PostComment[]) : [];

    const allComments = [
        ...rawComments,
        ...realtimeComments.filter(rc => !rawComments.some(c => c.id === rc.id)),
    ];

    const likeMutation = useMutation({
        mutationFn: () => postService.toggleLike(post.id),
        onMutate: () => {
            setLiked(p => !p);
            setLikeCount(p => liked ? p - 1 : p + 1);
        },
        onError: () => { setLiked(p => !p); setLikeCount(post.likeCount); },
    });

    const commentMutation = useMutation({
        mutationFn: () => postService.addComment(post.id, comment),
        onMutate: () => {
            if (!user || !comment.trim()) return;
            const opt: PostComment = { id: `temp-${Date.now()}`, postId: post.id, userId: user.id, content: comment, parentId: null, createdAt: new Date().toISOString() };
            setRealtimeComments(prev => [...prev, opt]);
            setComment('');
        },
        onError: () => setRealtimeComments(prev => prev.filter(c => !c.id.startsWith('temp-'))),
        onSuccess: (data) => {
            const real = (data as { data?: PostComment })?.data ?? (data as unknown as PostComment);
            setRealtimeComments(prev => prev.map(c => c.id.startsWith('temp-') ? real : c));
        },
    });

    const shopName = post.seller.sellerProfile?.shopName ?? post.seller.profile?.displayName ?? 'Shop';
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;
    const shopSlug = post.seller.sellerProfile?.shopSlug;

    return (
        <Box style={{ height: '100vh', display: 'flex', background: '#000' }}>
            {/* Video side */}
            <Box style={{ flex: '0 0 auto', width: 'min(56vh, 420px)', position: 'relative', background: '#000' }}>
                {post.videoUrl ? (
                    <video
                        ref={videoRef}
                        src={`${post.videoUrl}#t=0.001`}
                        poster={post.thumbnailUrl ?? undefined}
                        loop muted playsInline preload="metadata"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : post.images[0] ? (
                    <Image src={post.images[0]} alt={post.title} fill
                        style={{ objectFit: 'cover' }} sizes="420px" />
                ) : null}

                {/* Overlay info bottom */}
                <Box pos="absolute" bottom={80} left={12} right={60}
                    style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    <Group gap="xs" mb="xs">
                        <Avatar src={avatar} size={32} radius="xl">{shopName[0]}</Avatar>
                        {shopSlug ? (
                            <Link href={`/shop/${shopSlug}`} style={{ textDecoration: 'none' }}>
                                <Text fw={700} size="sm" c="white">{shopName}</Text>
                            </Link>
                        ) : (
                            <Text fw={700} size="sm" c="white">{shopName}</Text>
                        )}
                    </Group>
                    <Text fw={600} size="sm" c="white" mb={4}>{post.title}</Text>
                    {post.hashtags.length > 0 && (
                        <Group gap={4}>
                            {post.hashtags.slice(0, 3).map(tag => (
                                <Text key={tag} size="xs" c="white" style={{ opacity: 0.9 }}>#{tag}</Text>
                            ))}
                        </Group>
                    )}
                </Box>

                {/* Right action buttons */}
                <Stack pos="absolute" bottom={80} right={8} gap="lg" align="center">
                    <Stack gap={2} align="center">
                        <ActionIcon size="xl" radius="xl" variant="filled"
                            color={liked ? 'red' : 'dark'}
                            style={{ background: liked ? undefined : 'rgba(255,255,255,0.15)' }}
                            onClick={() => likeMutation.mutate()}>
                            <Iconify icon={liked ? 'solar:heart-bold' : 'solar:heart-linear'} width={22} />
                        </ActionIcon>
                        <Text size="xs" c="white" fw={600}>{likeCount}</Text>
                    </Stack>
                    <Stack gap={2} align="center">
                        <ActionIcon size="xl" radius="xl" variant="filled"
                            style={{ background: 'rgba(255,255,255,0.15)' }}>
                            <Iconify icon="solar:chat-round-dots-linear" width={22} />
                        </ActionIcon>
                        <Text size="xs" c="white" fw={600}>{post.commentCount}</Text>
                    </Stack>
                    <Stack gap={2} align="center">
                        <ActionIcon size="xl" radius="xl" variant="filled"
                            style={{ background: 'rgba(255,255,255,0.15)' }}>
                            <Iconify icon="solar:eye-linear" width={22} />
                        </ActionIcon>
                        <Text size="xs" c="white" fw={600}>{post.viewCount}</Text>
                    </Stack>
                </Stack>
            </Box>

            {/* Info + comments side */}
            <Box style={{ flex: 1, background: 'var(--mantine-color-body)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header */}
                <Group p="md" gap="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                    <Avatar src={avatar} size={40} radius="xl">{shopName[0]}</Avatar>
                    <Box style={{ flex: 1 }}>
                        <Text fw={600} size="sm">{shopName}</Text>
                        <Text size="xs" c="dimmed">{dayjs(post.createdAt).fromNow()}</Text>
                    </Box>
                </Group>

                {/* Content */}
                <Box px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                    <Text fw={600} mb={4}>{post.title}</Text>
                    {post.content && <RichTextContent html={post.content} size="sm" />}
                </Box>

                {/* Tagged products */}
                {post.productTags.length > 0 && (
                    <Box px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                        <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase">Sản phẩm</Text>
                        <Stack gap="xs">
                            {post.productTags.map(pt => (
                                <Box key={pt.id} component={Link} href={`/product/${pt.product.slug}`}
                                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--mantine-color-default-border)' }}>
                                    <Image src={pt.product.images[0]} alt={pt.product.name}
                                        width={40} height={40}
                                        style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                        <Text size="xs" truncate="end">{pt.product.name}</Text>
                                        <Text size="xs" fw={700} c="blue">{formatVND(pt.product.price)}</Text>
                                    </Box>
                                    <Iconify icon="solar:arrow-right-bold" width={14} style={{ opacity: 0.4 }} />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Comments */}
                <Text px="md" pt="sm" size="xs" fw={600} c="dimmed" tt="uppercase">
                    Bình luận ({post.commentCount + realtimeComments.length})
                </Text>
                <ScrollArea style={{ flex: 1 }} px="md" py="xs">
                    <Stack gap="sm">
                        {allComments.map(c => (
                            <Group key={c.id} align="flex-start" gap="xs">
                                <Avatar size={28} radius="xl" color="blue">{c.userId[0]}</Avatar>
                                <Box style={{ flex: 1 }}>
                                    <Text size="xs" c="dimmed">{dayjs(c.createdAt).fromNow()}</Text>
                                    <Text size="sm">{c.content}</Text>
                                </Box>
                            </Group>
                        ))}
                    </Stack>
                </ScrollArea>

                {/* Comment input */}
                {user && (
                    <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                        <Group gap="xs">
                            <TextInput
                                placeholder="Viết bình luận..."
                                value={comment}
                                onChange={e => setComment(e.currentTarget.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && comment.trim()) commentMutation.mutate(); }}
                                style={{ flex: 1 }} size="sm" radius="xl"
                            />
                            <ActionIcon size="lg" radius="xl" color="blue"
                                disabled={!comment.trim()} loading={commentMutation.isPending}
                                onClick={() => commentMutation.mutate()}>
                                <Iconify icon="solar:plain-bold" width={16} />
                            </ActionIcon>
                        </Group>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
