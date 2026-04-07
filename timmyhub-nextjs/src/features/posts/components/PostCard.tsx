'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Group, Avatar, Badge, ActionIcon, Stack, Image, Tooltip } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { formatVND } from '@/utils/currency';
import { useMutation } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import type { Post } from '@/types/post';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface PostCardProps {
    post: Post;
    onOpenDetail?: (post: Post) => void;
}

export function PostCard({ post, onOpenDetail }: PostCardProps) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);

    const handleOpen = () => {
        if (onOpenDetail) onOpenDetail(post);
        else router.push(`/posts?id=${post.id}`);
    };

    const likeMutation = useMutation({
        mutationFn: () => postService.toggleLike(post.id),
        onMutate: () => {
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
        },
        onError: () => {
            setLiked(prev => !prev);
            setLikeCount(post.likeCount);
        },
    });

    const shopName = post.seller.sellerProfile?.shopName ?? post.seller.profile?.displayName ?? 'Shop';
    const shopSlug = post.seller.sellerProfile?.shopSlug;
    const avatar = post.seller.sellerProfile?.shopLogo ?? post.seller.profile?.avatar;
    const hasVideo = !!post.videoUrl;
    const mainMedia = hasVideo ? post.thumbnailUrl ?? post.videoUrl : post.images[0];

    return (
        <Box
            style={{
                borderRadius: 'var(--mantine-radius-lg)',
                overflow: 'hidden',
                background: 'var(--mantine-color-body)',
                border: '1px solid var(--mantine-color-default-border)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Media */}
            <Box
                pos="relative"
                style={{ aspectRatio: '9/16', cursor: 'pointer', background: '#000', flexShrink: 0 }}
                onClick={() => router.push('/posts')}
            >
                {hasVideo ? (
                    <>
                        <video
                            ref={videoRef}
                            src={`${post.videoUrl!}#t=0.001`}
                            poster={post.thumbnailUrl ?? undefined}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            onMouseEnter={() => void videoRef.current?.play().catch(() => { })}
                            onMouseLeave={() => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; }}
                        />
                        {/* Play overlay khi chưa play */}
                        <Box
                            pos="absolute"
                            top="50%" left="50%"
                            style={{
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                opacity: 0.8,
                            }}
                        >
                            <Iconify icon="solar:play-circle-bold" width={40} color="white" />
                        </Box>
                    </>
                ) : mainMedia ? (
                    <Image src={mainMedia} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}

                {/* Video badge */}
                {hasVideo && (
                    <Badge pos="absolute" top={8} left={8} color="dark" variant="filled" size="xs"
                        leftSection={<Iconify icon="solar:play-bold" width={10} />}>
                        Video
                    </Badge>
                )}

                {/* Multiple images badge */}
                {!hasVideo && post.images.length > 1 && (
                    <Badge pos="absolute" top={8} right={8} color="dark" variant="filled" size="xs">
                        1/{post.images.length}
                    </Badge>
                )}

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                    <Box pos="absolute" bottom={8} left={8} right={8}>
                        <Group gap={4} wrap="nowrap" style={{ overflow: 'hidden' }}>
                            {post.hashtags.slice(0, 3).map(tag => (
                                <Badge key={tag} size="xs" variant="filled" color="dark"
                                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                                    #{tag}
                                </Badge>
                            ))}
                        </Group>
                    </Box>
                )}
            </Box>

            {/* Info */}
            <Stack gap="xs" p="sm" style={{ flex: 1 }}>
                {/* Seller */}
                <Group gap="xs" wrap="nowrap">
                    <Avatar src={avatar} size={28} radius="xl" color="blue">
                        {shopName[0]}
                    </Avatar>
                    {shopSlug ? (
                        <Text
                            size="xs" fw={600} truncate="end"
                            component={Link}
                            href={`/shop/${shopSlug}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {shopName}
                        </Text>
                    ) : (
                        <Text size="xs" fw={600} truncate="end">{shopName}</Text>
                    )}
                    <Text size="xs" c="dimmed" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        {dayjs(post.createdAt).fromNow()}
                    </Text>
                </Group>

                {/* Title */}
                <Text size="sm" fw={500} lineClamp={2} style={{ cursor: 'pointer' }}
                    onClick={handleOpen}>
                    {post.title}
                </Text>

                {/* Tagged products */}
                {post.productTags.length > 0 && (
                    <Box
                        style={{
                            background: 'var(--mantine-color-gray-0)',
                            borderRadius: 'var(--mantine-radius-sm)',
                            padding: '6px 8px',
                        }}
                    >
                        <Group gap="xs" wrap="nowrap">
                            <Iconify icon="solar:tag-bold" width={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                            <Text size="xs" truncate="end" c="dimmed">
                                {post.productTags[0].product.name}
                            </Text>
                            <Text size="xs" fw={700} c="blue" style={{ flexShrink: 0 }}>
                                {formatVND(post.productTags[0].product.price)}
                            </Text>
                        </Group>
                        {post.productTags.length > 1 && (
                            <Text size="xs" c="dimmed" mt={2}>+{post.productTags.length - 1} sản phẩm khác</Text>
                        )}
                    </Box>
                )}

                {/* Actions */}
                <Group gap="md" mt="auto">
                    <Tooltip label={liked ? 'Bỏ thích' : 'Thích'}>
                        <ActionIcon
                            variant="subtle"
                            color={liked ? 'red' : 'gray'}
                            size="sm"
                            onClick={() => likeMutation.mutate()}
                        >
                            <Iconify icon={liked ? 'solar:heart-bold' : 'solar:heart-linear'} width={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Text size="xs" c="dimmed">{likeCount}</Text>

                    <ActionIcon variant="subtle" color="gray" size="sm"
                        onClick={handleOpen}>
                        <Iconify icon="solar:chat-round-dots-linear" width={16} />
                    </ActionIcon>
                    <Text size="xs" c="dimmed">{post.commentCount}</Text>

                    <Text size="xs" c="dimmed" style={{ marginLeft: 'auto' }}>
                        <Iconify icon="solar:eye-linear" width={12} style={{ marginRight: 2 }} />
                        {post.viewCount}
                    </Text>
                </Group>
            </Stack>
        </Box>
    );
}
