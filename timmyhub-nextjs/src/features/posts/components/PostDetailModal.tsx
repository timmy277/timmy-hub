'use client';

import { Modal, Group, Avatar, Text, Stack, Box, ScrollArea, TextInput, Button, ActionIcon, Divider, Image, Badge } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { formatVND } from '@/utils/currency';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Post } from '@/types/post';
import dayjs from 'dayjs';

interface PostDetailModalProps {
    post: Post;
    opened: boolean;
    onClose: () => void;
}

export function PostDetailModal({ post, opened, onClose }: PostDetailModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');

    const { data: commentsData } = useQuery({
        queryKey: ['post-comments', post.id],
        queryFn: () => postService.getComments(post.id),
        enabled: opened,
    });

    const commentMutation = useMutation({
        mutationFn: () => postService.addComment(post.id, comment),
        onSuccess: () => {
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['post-comments', post.id] });
        },
    });

    const shopName = post.seller.sellerProfile?.shopName ?? 'Shop';
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;

    return (
        <Modal opened={opened} onClose={onClose} size="xl" padding={0} withCloseButton={false}
            styles={{ body: { padding: 0 }, content: { overflow: 'hidden' } }}>
            <Group align="stretch" wrap="nowrap" style={{ height: '85vh' }}>
                {/* Media side */}
                <Box style={{ flex: '0 0 55%', background: '#000', position: 'relative' }}>
                    {post.videoUrl ? (
                        <video
                            src={post.videoUrl}
                            poster={post.thumbnailUrl ?? undefined}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            controls autoPlay muted
                        />
                    ) : post.images[0] ? (
                        <Image src={post.images[0]} alt={post.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                </Box>

                {/* Info side */}
                <Stack style={{ flex: 1, minWidth: 0 }} gap={0}>
                    {/* Header */}
                    <Group p="md" gap="sm">
                        <Avatar src={avatar} size={40} radius="xl">{shopName[0]}</Avatar>
                        <Box style={{ flex: 1 }}>
                            <Text fw={600} size="sm">{shopName}</Text>
                            <Text size="xs" c="dimmed">{dayjs(post.createdAt).fromNow()}</Text>
                        </Box>
                    </Group>
                    <Divider />

                    <ScrollArea style={{ flex: 1 }} p="md">
                        <Stack gap="md">
                            {/* Title & content */}
                            <Box>
                                <Text fw={600}>{post.title}</Text>
                                {post.content && <Text size="sm" c="dimmed" mt={4}>{post.content}</Text>}
                                {post.hashtags.length > 0 && (
                                    <Group gap={4} mt="xs">
                                        {post.hashtags.map(tag => (
                                            <Text key={tag} size="xs" c="blue">#{tag}</Text>
                                        ))}
                                    </Group>
                                )}
                            </Box>

                            {/* Tagged products */}
                            {post.productTags.length > 0 && (
                                <Box>
                                    <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase">Sản phẩm trong video</Text>
                                    <Stack gap="xs">
                                        {post.productTags.map(pt => (
                                            <Group key={pt.id} component={Link} href={`/product/${pt.product.slug}`}
                                                gap="sm" wrap="nowrap"
                                                style={{ textDecoration: 'none', color: 'inherit', padding: '8px', borderRadius: 8, border: '1px solid var(--mantine-color-default-border)' }}>
                                                <Image src={pt.product.images[0]} alt={pt.product.name}
                                                    w={48} h={48} radius="sm" fit="cover" />
                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Text size="sm" truncate="end">{pt.product.name}</Text>
                                                    <Text size="sm" fw={700} c="blue">{formatVND(pt.product.price)}</Text>
                                                </Box>
                                                <Iconify icon="solar:arrow-right-bold" width={16} style={{ opacity: 0.4 }} />
                                            </Group>
                                        ))}
                                    </Stack>
                                </Box>
                            )}

                            <Divider />

                            {/* Comments */}
                            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                                Bình luận ({commentsData?.data?.length ?? 0})
                            </Text>
                            {commentsData?.data?.map(c => (
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
                                    style={{ flex: 1 }}
                                    size="sm"
                                    radius="xl"
                                />
                                <ActionIcon size="lg" radius="xl" color="blue"
                                    disabled={!comment.trim()}
                                    loading={commentMutation.isPending}
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
