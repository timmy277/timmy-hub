'use client';

import { lazy, useState, useRef, Suspense } from 'react';
import {
    Paper,
    Group,
    Stack,
    Avatar,
    Text,
    Rating,
    Badge,
    ActionIcon,
    SimpleGrid,
    Box,
    TextInput,
    Collapse,
    Loader,
} from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import Iconify from '@/components/iconify/Iconify';
import Image from 'next/image';
import { reviewService } from '@/services/review.service';
import { useChatStore } from '@/stores/useChatStore';
import type { Review } from '@/types/review';
import { useTranslation } from 'react-i18next';

const MediaLightbox = lazy(() => import('./MediaLightbox').then(m => ({ default: m.MediaLightbox })));

interface ReviewCardProps {
    review: Review;
    voted: boolean;
    onToggleHelpful: (id: string) => void;
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
}

export function ReviewCard({ review, voted, onToggleHelpful }: ReviewCardProps) {
    const { t } = useTranslation('common');
    const displayName = review.user.profile?.displayName ?? t('reviews.anonymous');
    const avatar = review.user.profile?.avatar;
    const initials = displayName.slice(0, 2).toUpperCase();
    const openChat = useChatStore((state) => state.openChat);

    const mediaItems = [
        ...review.images.map(src => ({ src, type: 'image' as const })),
        ...review.videos.map(src => ({ src, type: 'video' as const })),
    ];
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    const commentMutation = useMutation({
        mutationFn: (data: { content: string; parentId?: string }) =>
            reviewService.addComment(review.id, data.content, data.parentId),
        onSuccess: () => {
            setCommentText('');
            setReplyToId(undefined);
        },
    });

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        commentMutation.mutate({ content: commentText, parentId: replyToId });
    };

    const handleOpenChat = (userId: string, name: string, userAvatar: string | null | undefined) => {
        openChat({
            id: userId,
            name,
            avatar: userAvatar || null,
        });
    };

    return (
        <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
                {/* Header */}
                <Group gap="sm" justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        <Avatar
                            src={avatar}
                            radius="xl"
                            size="md"
                            color="orange"
                            className="cursor-pointer"
                            onClick={() => handleOpenChat(review.userId, displayName, avatar)}
                        >
                            {initials}
                        </Avatar>
                        <Box>
                            <Text
                                fw={600}
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => handleOpenChat(review.userId, displayName, avatar)}
                            >
                                {displayName}
                            </Text>
                            <Text size="xs" c="dimmed">{timeAgo(review.createdAt)}</Text>
                        </Box>
                    </Group>
                    {review.isVerified && (
                        <Badge
                            size="xs"
                            variant="light"
                            color="green"
                            leftSection={<Iconify icon="tabler:shield" width={10} />}
                        >
                            {t('reviews.verifiedBadge')}
                        </Badge>
                    )}
                </Group>

                {/* Stars */}
                <Rating value={review.rating} readOnly size="sm" />

                {/* Comment */}
                {review.comment && (
                    <Text size="sm" className="leading-relaxed">{review.comment}</Text>
                )}

                {/* Media grid */}
                {mediaItems.length > 0 && (
                    <SimpleGrid
                        cols={{ base: 2, xs: 3, sm: Math.min(mediaItems.length, 5) }}
                        spacing="xs"
                    >
                        {mediaItems.map((item, i) => (
                            <Box
                                key={i}
                                className="rounded-lg overflow-hidden cursor-pointer relative aspect-square bg-black"
                                onClick={() => setLightboxIdx(i)}
                            >
                                {item.type === 'image' ? (
                                    <Image
                                        src={item.src}
                                        alt={`Ảnh review ${i + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <>
                                        <video
                                            src={item.src}
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                        />
                                        {/* Play overlay */}
                                        <Box className="absolute inset-0 flex items-center justify-center bg-black/35">
                                            <Box className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M3 2L12 7L3 12V2Z" fill="#222" />
                                                </svg>
                                            </Box>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        ))}
                    </SimpleGrid>
                )}

                {/* Lightbox */}
                {lightboxIdx !== null && (
                    <Suspense fallback={<LightboxPlaceholder />}>
                        <MediaLightbox
                            items={mediaItems}
                            startIndex={lightboxIdx}
                            onClose={() => setLightboxIdx(null)}
                        />
                    </Suspense>
                )}

                {/* Actions: Helpful & Comment toggle */}
                <Group gap="md" pt={4}>
                    <Group gap="xs">
                        <ActionIcon
                            variant={voted ? 'filled' : 'subtle'}
                            color={voted ? 'blue' : 'gray'}
                            size="sm"
                            radius="xl"
                            onClick={() => onToggleHelpful(review.id)}
                            title={voted ? 'Bỏ vote hữu ích' : 'Đánh dấu hữu ích'}
                        >
                            <Iconify icon="tabler:thumb-up" width={14} />
                        </ActionIcon>
                        <Text size="xs" c={voted ? 'blue' : 'dimmed'}>
                            {review.helpfulCount > 0 ? `${review.helpfulCount}` : '0'}
                        </Text>
                    </Group>

                    <Group
                        gap="xs"
                        className="cursor-pointer"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <ActionIcon variant="subtle" color="gray" size="sm" radius="xl">
                            <Iconify icon="tabler:message-circle" width={14} />
                        </ActionIcon>
                        <Text size="xs" c="dimmed">{t('reviews.commentCount', { count: review.comments?.length || 0 })}</Text>
                    </Group>
                </Group>

                <Collapse in={showComments}>
                    <Box mt="sm" p="sm" className="bg-gray-0 rounded-lg">
                        <Stack gap="sm">
                            {(review.comments || []).filter(cmt => !cmt.parentId).map(cmt => (
                                <Box key={cmt.id}>
                                    <Group align="flex-start" gap="sm" wrap="nowrap">
                                        <Avatar
                                            src={cmt.user.profile?.avatar}
                                            radius="xl"
                                            size="sm"
                                            color="blue"
                                            className="cursor-pointer"
                                            onClick={() => handleOpenChat(cmt.userId, cmt.user.profile?.displayName || t('reviews.anonymous'), cmt.user.profile?.avatar)}
                                        >
                                            {cmt.user.profile?.displayName?.slice(0, 2).toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Group gap="xs" align="baseline">
                                                <Text
                                                    fw={600}
                                                    size="xs"
                                                    className="cursor-pointer"
                                                    onClick={() => handleOpenChat(cmt.userId, cmt.user.profile?.displayName || t('reviews.anonymous'), cmt.user.profile?.avatar)}
                                                >
                                                    {cmt.user.profile?.displayName || t('reviews.anonymous')}
                                                </Text>
                                                <Text size="xs" c="dimmed" className="text-[10px]">{timeAgo(cmt.createdAt)}</Text>
                                            </Group>
                                            <Text size="sm">{cmt.content}</Text>

                                            <Text
                                                size="xs"
                                                c="orange"
                                                className="cursor-pointer mt-1 inline-block"
                                                onClick={() => {
                                                    setReplyToId(cmt.id);
                                                    setCommentText(`@${cmt.user.profile?.displayName || t('reviews.anonymous')} `);
                                                    inputRef.current?.focus();
                                                }}
                                            >
                                                {t('reviews.reply')}
                                            </Text>
                                        </Box>
                                    </Group>

                                    {/* Sub-comments (replies) */}
                                    {cmt.replies && cmt.replies.length > 0 && (
                                        <Stack gap="xs" mt="xs" ml={32}>
                                            {cmt.replies.map(reply => (
                                                <Group key={reply.id} align="flex-start" gap="sm" wrap="nowrap">
                                                    <Avatar
                                                        src={reply.user.profile?.avatar}
                                                        radius="xl"
                                                        size="xs"
                                                        color="gray"
                                                        className="cursor-pointer"
                                                        onClick={() => handleOpenChat(reply.userId, reply.user.profile?.displayName || t('reviews.anonymous'), reply.user.profile?.avatar)}
                                                    >
                                                        {reply.user.profile?.displayName?.slice(0, 2).toUpperCase() || 'U'}
                                                    </Avatar>
                                                    <Box flex={1}>
                                                        <Group gap="xs" align="baseline">
                                                            <Text
                                                                fw={600}
                                                                size="xs"
                                                                className="cursor-pointer"
                                                                style={{ fontSize: 11 }}
                                                                onClick={() => handleOpenChat(reply.userId, reply.user.profile?.displayName || t('reviews.anonymous'), reply.user.profile?.avatar)}
                                                            >
                                                                {reply.user.profile?.displayName || t('reviews.anonymous')}
                                                            </Text>
                                                            <Text size="xs" c="dimmed" className="text-[9px]">{timeAgo(reply.createdAt)}</Text>
                                                        </Group>
                                                        <Text size="sm" className="text-[13px]">{reply.content}</Text>
                                                        <Text
                                                            size="xs"
                                                            c="orange"
                                                            className="cursor-pointer mt-1 inline-block"
                                                            onClick={() => {
                                                                setReplyToId(cmt.id);
                                                                setCommentText(`@${reply.user.profile?.displayName || t('reviews.anonymous')} `);
                                                                inputRef.current?.focus();
                                                            }}
                                                        >
                                                            {t('reviews.reply')}
                                                        </Text>
                                                    </Box>
                                                </Group>
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            ))}

                            <form onSubmit={handleCommentSubmit} className="mt-2">
                                {replyToId && (
                                    <Group justify="space-between" className="mb-2">
                                        <Text size="xs" c="dimmed">
                                            {t('reviews.replyingTo')}
                                        </Text>
                                        <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => {
                                            setReplyToId(undefined);
                                            setCommentText('');
                                        }}>
                                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                                <path d="M1 1L13 13M1 13L13 1L1 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </ActionIcon>
                                    </Group>
                                )}
                                <TextInput
                                    ref={inputRef}
                                    placeholder={replyToId ? t('reviews.writeReply') : t('reviews.writeComment')}
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    size="sm"
                                    radius="xl"
                                    rightSection={
                                        <ActionIcon
                                            size={28}
                                            radius="xl"
                                            color="orange"
                                            variant="filled"
                                            disabled={!commentText.trim() || commentMutation.isPending}
                                            onClick={handleCommentSubmit}
                                        >
                                            {commentMutation.isPending ? <Loader size={12} color="white" /> : <Iconify icon="tabler:send" width={14} />}
                                        </ActionIcon>
                                    }
                                />
                            </form>
                        </Stack>
                    </Box>
                </Collapse>
            </Stack>
        </Paper>
    );
}

// Placeholder when lightbox is loading
function LightboxPlaceholder() {
    return null;
}
