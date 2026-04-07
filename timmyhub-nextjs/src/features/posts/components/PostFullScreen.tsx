'use client';

import { useRef, useState, useEffect } from 'react';
import { Avatar, Text, Group, ActionIcon, Stack, Box, Badge, TextInput, ScrollArea } from '@mantine/core';
import Image from 'next/image';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { formatVND } from '@/utils/currency';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { useAuth } from '@/hooks/useAuth';
import { RichTextContent } from '@/components/common/RichTextContent';
import type { Post, PostComment } from '@/types/post';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface PostFullScreenProps {
    post: Post;
    isActive: boolean;
}

export function PostFullScreen({ post, isActive }: PostFullScreenProps) {
    const { user } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [realtimeComments, setRealtimeComments] = useState<PostComment[]>([]);
    const socketRef = useRef<Socket | null>(null);

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

    // Socket cho realtime comments
    useEffect(() => {
        if (!showComments) {
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
    }, [showComments, post.id]);

    const { data: commentsData } = useQuery({
        queryKey: ['post-comments', post.id],
        queryFn: () => postService.getComments(post.id),
        enabled: showComments,
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
            setRealtimeComments(p => [...p, opt]);
            setComment('');
        },
    });

    const shopName = post.seller.sellerProfile?.shopName ?? post.seller.profile?.displayName ?? 'Shop';
    const shopSlug = post.seller.sellerProfile?.shopSlug;
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;
    const hasVideo = !!post.videoUrl;

    return (
        <Box style={{ width: '100%', height: '100%', position: 'relative', background: '#000', display: 'flex' }}>
            {/* Video / Image */}
            <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {hasVideo ? (
                    <video
                        ref={videoRef}
                        src={`${post.videoUrl}#t=0.001`}
                        poster={post.thumbnailUrl ?? undefined}
                        loop muted playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : post.images[0] ? (
                    <Image src={post.images[0]} alt={post.title} fill
                        style={{ objectFit: 'cover' }} sizes="100vw" />
                ) : null}

                {/* Gradient overlay bottom */}
                <Box style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    pointerEvents: 'none',
                }} />

                {/* Post info overlay */}
                <Box pos="absolute" bottom={80} left={16} right={80} style={{ color: '#fff' }}>
                    <Group gap="xs" mb="xs">
                        <Avatar src={avatar} size={36} radius="xl">{shopName[0]}</Avatar>
                        {shopSlug ? (
                            <Link href={`/shop/${shopSlug}`} style={{ textDecoration: 'none' }}>
                                <Text fw={700} size="sm" c="white">{shopName}</Text>
                            </Link>
                        ) : (
                            <Text fw={700} size="sm" c="white">{shopName}</Text>
                        )}
                        <Badge size="xs" color="blue" variant="filled">Theo dõi</Badge>
                    </Group>
                    <Text fw={600} size="sm" c="white" mb={4}>{post.title}</Text>
                    {post.content && (
                        <Box style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                            <RichTextContent html={post.content} size="sm" />
                        </Box>
                    )}
                    {post.hashtags.length > 0 && (
                        <Group gap={4} mt={4}>
                            {post.hashtags.map(tag => (
                                <Text key={tag} size="xs" c="blue.3">#{tag}</Text>
                            ))}
                        </Group>
                    )}
                    {/* Tagged products */}
                    {post.productTags.length > 0 && (
                        <Box mt="xs" p="xs" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, backdropFilter: 'blur(8px)' }}>
                            <Group gap="xs" wrap="nowrap">
                                <Iconify icon="solar:tag-bold" width={14} color="white" />
                                <Text size="xs" c="white" truncate="end">{post.productTags[0].product.name}</Text>
                                <Text size="xs" fw={700} c="yellow.3" style={{ flexShrink: 0 }}>
                                    {formatVND(post.productTags[0].product.price)}
                                </Text>
                            </Group>
                        </Box>
                    )}
                </Box>

                {/* Nav arrows removed — scroll snap handles navigation */}
            </Box>

            {/* Right action bar */}
            <Stack
                gap="lg"
                pos="absolute"
                right={16}
                bottom={100}
                align="center"
            >
                <Stack gap={2} align="center">
                    <ActionIcon size={48} radius="xl" variant="filled"
                        color={liked ? 'red' : 'dark'}
                        style={{ opacity: 0.9 }}
                        onClick={() => likeMutation.mutate()}>
                        <Iconify icon={liked ? 'solar:heart-bold' : 'solar:heart-linear'} width={24} />
                    </ActionIcon>
                    <Text size="xs" c="white" fw={600}>{likeCount}</Text>
                </Stack>

                <Stack gap={2} align="center">
                    <ActionIcon size={48} radius="xl" variant="filled" color="dark"
                        style={{ opacity: 0.9 }}
                        onClick={() => setShowComments(p => !p)}>
                        <Iconify icon="solar:chat-round-dots-bold" width={24} />
                    </ActionIcon>
                    <Text size="xs" c="white" fw={600}>{post.commentCount}</Text>
                </Stack>

                <ActionIcon size={48} radius="xl" variant="filled" color="dark" style={{ opacity: 0.9 }}>
                    <Iconify icon="solar:share-bold" width={24} />
                </ActionIcon>
            </Stack>

            {/* Comments panel slide in */}
            {showComments && (
                <Box style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '60%',
                    background: 'var(--mantine-color-body)',
                    borderRadius: '16px 16px 0 0',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
                }}>
                    <Group justify="space-between" p="md" pb="xs">
                        <Text fw={700}>Bình luận ({post.commentCount + realtimeComments.length})</Text>
                        <ActionIcon variant="subtle" onClick={() => setShowComments(false)}>
                            <Iconify icon="solar:close-circle-bold" width={20} />
                        </ActionIcon>
                    </Group>

                    <ScrollArea style={{ flex: 1 }} px="md">
                        <Stack gap="md" pb="md">
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
            )}
        </Box>
    );
}
