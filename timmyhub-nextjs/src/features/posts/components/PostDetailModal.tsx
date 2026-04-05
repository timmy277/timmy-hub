'use client';

import { Modal, Group, Avatar, Text, Stack, Box, ScrollArea, TextInput, ActionIcon, Divider, Image } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery, useMutation } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { formatVND } from '@/utils/currency';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { RichTextContent } from '@/components/common/RichTextContent';
import { useAuth } from '@/hooks/useAuth';
import type { Post, PostComment } from '@/types/post';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface PostDetailModalProps {
    post: Post;
    opened: boolean;
    onClose: () => void;
}

export function PostDetailModal({ post, opened, onClose }: PostDetailModalProps) {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [realtimeComments, setRealtimeComments] = useState<PostComment[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { data: commentsData } = useQuery({
        queryKey: ['post-comments', post.id],
        queryFn: () => postService.getComments(post.id),
        enabled: opened,
    });

    const allComments = [
        ...(commentsData?.data ?? []),
        ...realtimeComments.filter(rc => !commentsData?.data?.some(c => c.id === rc.id)),
    ];

    useEffect(() => {
        if (!opened) {
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

        socket.on('post:new_comment', (newComment: PostComment) => {
            setRealtimeComments(prev =>
                prev.some(c => c.id === newComment.id) ? prev : [...prev, newComment]
            );
            setTimeout(() => {
                const el = scrollAreaRef.current;
                if (el) el.scrollTop = el.scrollHeight;
            }, 50);
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [opened, post.id]);

    const commentMutation = useMutation({
        mutationFn: () => postService.addComment(post.id, comment),
        onSuccess: () => setComment(''),
    });

    const shopName = post.seller.sellerProfile?.shopName ?? 'Shop';
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;

    return (
        <Modal opened={opened} onClose={onClose} size="xl" padding={0} withCloseButton={false}
            styles={{ body: { padding: 0 }, content: { overflow: 'hidden' } }}>
            <Group align="stretch" wrap="nowrap" style={{ height: '85vh' }}>
                {/* Media */}
                <Box style={{ flex: '0 0 55%', background: '#000' }}>
                    {post.videoUrl ? (
                        <video src={post.videoUrl} poster={post.thumbnailUrl ?? undefined}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            controls autoPlay muted />
                    ) : post.images[0] ? (
                        <Image src={post.images[0]} alt={post.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                </Box>

                {/* Info */}
                <Stack style={{ flex: 1, minWidth: 0 }} gap={0}>
                    <Group p="md" gap="sm">
                        <Avatar src={avatar} size={40} radius="xl">{shopName[0]}</Avatar>
                        <Box style={{ flex: 1 }}>
                            <Text fw={600} size="sm">{shopName}</Text>
                            <Text size="xs" c="dimmed">{dayjs(post.createdAt).fromNow()}</Text>
                        </Box>
                    </Group>
                    <Divider />

                    <ScrollArea style={{ flex: 1 }} viewportRef={scrollAreaRef} p="md">
                        <Stack gap="md">
                            <Box>
                                <Text fw={600}>{post.title}</Text>
                                {post.content && <Box mt={4}><RichTextContent html={post.content} size="sm" /></Box>}
                                {post.hashtags.length > 0 && (
                                    <Group gap={4} mt="xs">
                                        {post.hashtags.map(tag => (
                                            <Text key={tag} size="xs" c="blue">#{tag}</Text>
                                        ))}
                                    </Group>
                                )}
                            </Box>

                            {post.productTags.length > 0 && (
                                <Box>
                                    <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase">Sản phẩm trong video</Text>
                                    <Stack gap="xs">
                                        {post.productTags.map(pt => (
                                            <Box key={pt.id} component={Link} href={`/product/${pt.product.slug}`}
                                                style={{ textDecoration: 'none', color: 'inherit', padding: 8, borderRadius: 8, border: '1px solid var(--mantine-color-default-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Image src={pt.product.images[0]} alt={pt.product.name} w={48} h={48} radius="sm" fit="cover" style={{ flexShrink: 0 }} />
                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Text size="sm" truncate="end">{pt.product.name}</Text>
                                                    <Text size="sm" fw={700} c="blue">{formatVND(pt.product.price)}</Text>
                                                </Box>
                                                <Iconify icon="solar:arrow-right-bold" width={16} style={{ opacity: 0.4 }} />
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Divider />

                            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                                Bình luận ({allComments.length})
                            </Text>
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
                </Stack>
            </Group>
        </Modal>
    );
}
