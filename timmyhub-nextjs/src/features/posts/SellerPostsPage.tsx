'use client';

import { useState } from 'react';
import { Container, Button, Group, Modal, Text, ActionIcon, Menu, Badge, Stack, Paper, Image, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { CreatePostForm } from './components/CreatePostForm';
import { PostDetailModal } from './components/PostDetailModal';
import Iconify from '@/components/iconify/Iconify';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import type { Post } from '@/types/post';
import dayjs from 'dayjs';

export function SellerPostsPage() {
    const queryClient = useQueryClient();
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [previewPost, setPreviewPost] = useState<Post | null>(null);
    const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['posts-mine'],
        queryFn: ({ pageParam }) => postService.getMyPosts({ cursor: pageParam as string | undefined }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: p => p.nextCursor ?? undefined,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => postService.delete(id),
        onSuccess: () => {
            notifications.show({ message: 'Đã xóa bài đăng', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['posts-mine'] });
        },
    });

    const togglePinMutation = useMutation({
        mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => postService.update(id, { isPinned }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts-mine'] }),
    });

    const allPosts = data?.pages.flatMap(p => p.data) ?? [];

    const handleRowClick = (post: Post) => {
        setPreviewPost(post);
        openPreview();
    };

    const confirmDelete = (e: React.MouseEvent, post: Post) => {
        e.stopPropagation();
        modals.openConfirmModal({
            title: 'Xóa bài đăng',
            children: <Text size="sm">Bạn có chắc muốn xóa &quot;{post.title}&quot;?</Text>,
            labels: { confirm: 'Xóa', cancel: 'Hủy' },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteMutation.mutate(post.id),
        });
    };

    return (
        <Container fluid p="md">
            <Group justify="flex-end" mb="xl">
                <Button leftSection={<Iconify icon="solar:add-circle-bold" width={18} />} onClick={openCreate}>
                    Tạo bài đăng
                </Button>
            </Group>

            {isLoading ? (
                <Text c="dimmed">Đang tải...</Text>
            ) : allPosts.length === 0 ? (
                <Paper withBorder p="xl" ta="center" radius="md">
                    <Iconify icon="solar:video-frame-bold" width={48} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" mt="md">Chưa có bài đăng nào. Tạo bài đăng đầu tiên!</Text>
                    <Button mt="md" onClick={openCreate}>Tạo ngay</Button>
                </Paper>
            ) : (
                <Stack gap="sm">
                    {allPosts.map(post => (
                        <Paper
                            key={post.id} withBorder p="md" radius="md"
                            style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                            onClick={() => handleRowClick(post)}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--mantine-color-gray-0)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                            <Group wrap="nowrap" gap="md">
                                <Box style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#111' }}>
                                    {post.thumbnailUrl || post.images[0] ? (
                                        <Image src={post.thumbnailUrl ?? post.images[0]} alt={post.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : post.videoUrl ? (
                                        <video
                                            src={`${post.videoUrl}#t=0.001`}
                                            preload="metadata"
                                            muted playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    ) : (
                                        <Box style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Iconify icon="solar:video-frame-bold" width={28} color="white" />
                                        </Box>
                                    )}
                                </Box>

                                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                                    <Group gap="xs">
                                        {post.isPinned && <Badge size="xs" color="orange">Ghim</Badge>}
                                        <Badge size="xs" color={post.status === 'PUBLISHED' ? 'green' : 'gray'}>
                                            {post.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                                        </Badge>
                                    </Group>
                                    <Text fw={600} truncate="end">{post.title}</Text>
                                    <Group gap="lg">
                                        <Group gap={4}><Iconify icon="solar:eye-linear" width={13} style={{ opacity: 0.5 }} /><Text size="xs" c="dimmed">{post.viewCount}</Text></Group>
                                        <Group gap={4}><Iconify icon="solar:heart-linear" width={13} style={{ opacity: 0.5 }} /><Text size="xs" c="dimmed">{post.likeCount}</Text></Group>
                                        <Group gap={4}><Iconify icon="solar:chat-round-dots-linear" width={13} style={{ opacity: 0.5 }} /><Text size="xs" c="dimmed">{post.commentCount}</Text></Group>
                                        <Text size="xs" c="dimmed">{dayjs(post.createdAt).format('DD/MM/YYYY')}</Text>
                                    </Group>
                                </Stack>

                                <Menu position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" color="gray" onClick={e => e.stopPropagation()}>
                                            <Iconify icon="solar:menu-dots-bold" width={18} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<Iconify icon={post.isPinned ? 'solar:pin-bold' : 'solar:pin-linear'} width={16} />}
                                            onClick={e => { e.stopPropagation(); togglePinMutation.mutate({ id: post.id, isPinned: !post.isPinned }); }}
                                        >
                                            {post.isPinned ? 'Bỏ ghim' : 'Ghim bài'}
                                        </Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item color="red"
                                            leftSection={<Iconify icon="solar:trash-bin-bold" width={16} />}
                                            onClick={e => confirmDelete(e, post)}
                                        >
                                            Xóa
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </Paper>
                    ))}

                    {hasNextPage && (
                        <Button variant="light" fullWidth onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
                            Xem thêm
                        </Button>
                    )}
                </Stack>
            )}

            {/* Create modal */}
            <Modal opened={createOpened} onClose={closeCreate} title="Tạo bài đăng mới" size="lg">
                <CreatePostForm onSuccess={closeCreate} />
            </Modal>

            {/* Preview modal */}
            {previewPost && (
                <PostDetailModal post={previewPost} opened={previewOpened} onClose={closePreview} />
            )}
        </Container>
    );
}
