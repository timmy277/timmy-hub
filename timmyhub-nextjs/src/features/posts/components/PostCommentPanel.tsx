'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, Text, Group, ActionIcon, Box, TextInput, ScrollArea, Stack } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
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
const PANEL_W = 360;

interface Props {
    post: Post;
    open: boolean;
    onClose: () => void;
}

export function PostCommentPanel({ post, open, onClose }: Props) {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [comment, setComment] = useState('');
    const [realtimeComments, setRealtimeComments] = useState<PostComment[]>([]);

    useEffect(() => {
        if (!open) { socketRef.current?.disconnect(); socketRef.current = null; return; }
        const socket = io(`${SOCKET_URL}/posts`, {
            auth: { token: Cookies.get('access_token') },
            withCredentials: true, transports: ['websocket', 'polling'],
        });
        socket.on('connect', () => socket.emit('post:join', post.id));
        socket.on('post:new_comment', (c: PostComment) => {
            setRealtimeComments(prev => prev.some(x => x.id === c.id) ? prev : [...prev, c]);
        });
        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [open, post.id]);

    const { data: commentsData } = useQuery({
        queryKey: ['post-comments', post.id],
        queryFn: () => postService.getComments(post.id),
        enabled: open, staleTime: 0,
    });

    const rawComments: PostComment[] = Array.isArray((commentsData as { data?: unknown })?.data)
        ? (commentsData as { data: PostComment[] }).data
        : Array.isArray(commentsData) ? (commentsData as unknown as PostComment[]) : [];

    const allComments = [...rawComments, ...realtimeComments.filter(rc => !rawComments.some(c => c.id === rc.id))];

    const commentMutation = useMutation({
        mutationFn: () => postService.addComment(post.id, comment),
        onMutate: () => {
            if (!user || !comment.trim()) return;
            setRealtimeComments(p => [...p, {
                id: `temp-${Date.now()}`, postId: post.id, userId: user.id,
                content: comment, parentId: null, createdAt: new Date().toISOString(),
            }]);
            setComment('');
        },
    });

    const shopName = post.seller.sellerProfile?.shopName ?? post.seller.profile?.displayName ?? 'Shop';
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;

    return (
        <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: open ? PANEL_W : 0,
            overflow: 'hidden',
            transition: 'width 0.25s ease',
            zIndex: 20,
        }}>
            <div style={{ width: PANEL_W, height: '100%', background: 'var(--mantine-color-body)', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--mantine-color-default-border)' }}>
                {/* Header */}
                <Group justify="space-between" px="md" py="sm"
                    style={{ borderBottom: '1px solid var(--mantine-color-default-border)', flexShrink: 0 }}>
                    <Text fw={700}>Bình luận ({post.commentCount + realtimeComments.length})</Text>
                    <ActionIcon variant="subtle" onClick={onClose}>
                        <Iconify icon="solar:close-circle-bold" width={20} />
                    </ActionIcon>
                </Group>

                {/* Seller */}
                <Group px="md" py="sm" gap="sm"
                    style={{ borderBottom: '1px solid var(--mantine-color-default-border)', flexShrink: 0 }}>
                    <Avatar src={avatar} size={36} radius="xl">{shopName[0]}</Avatar>
                    <Box style={{ flex: 1 }}>
                        <Text fw={600} size="sm">{shopName}</Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>{post.title}</Text>
                    </Box>
                </Group>

                {/* List */}
                <ScrollArea style={{ flex: 1 }} px="md" scrollbarSize={4}>
                    <Stack gap="md" py="md">
                        {allComments.length === 0 && (
                            <Text size="sm" c="dimmed" ta="center" py="xl">Chưa có bình luận nào</Text>
                        )}
                        {allComments.map(c => (
                            <Group key={c.id} align="flex-start" gap="xs">
                                <Avatar size={30} radius="xl" color="blue">{c.userId[0]}</Avatar>
                                <Box style={{ flex: 1 }}>
                                    <Group gap="xs">
                                        <Text size="xs" fw={600}>{c.userId.slice(0, 8)}</Text>
                                        <Text size="xs" c="dimmed">{dayjs(c.createdAt).fromNow()}</Text>
                                    </Group>
                                    <Text size="sm" mt={2}>{c.content}</Text>
                                    <Text size="xs" c="dimmed" mt={2} style={{ cursor: 'pointer' }}>↩ Trả lời</Text>
                                </Box>
                            </Group>
                        ))}
                    </Stack>
                </ScrollArea>

                {/* Input */}
                {user && (
                    <Box px="md" py="sm"
                        style={{ borderTop: '1px solid var(--mantine-color-default-border)', flexShrink: 0 }}>
                        <Group gap="xs">
                            <Avatar src={user.profile?.avatar} size={28} radius="xl" color="blue">
                                {user.profile?.firstName?.[0] ?? 'U'}
                            </Avatar>
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
            </div>
        </div>
    );
}
