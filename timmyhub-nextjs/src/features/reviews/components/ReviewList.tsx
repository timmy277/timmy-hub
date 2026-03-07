'use client';

/**
 * ReviewList — Danh sách đánh giá sản phẩm với real-time Socket.io
 * UI: Rating breakdown + filter + sort + từng review card
 * Không dùng CSS module — Mantine + Tailwind
 */
import { useState, useCallback } from 'react';
import {
    Stack,
    Group,
    Text,
    Rating,
    Avatar,
    Badge,
    Button,
    Progress,
    Paper,
    SegmentedControl,
    Divider,
    Box,
    ActionIcon,
    SimpleGrid,
    Loader,
    Center,
    ThemeIcon,
    Title,
    Modal,
} from '@mantine/core';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    IconStar,
    IconThumbUp,
    IconShield,
    IconMoodEmpty,
} from '@tabler/icons-react';

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

import { reviewService } from '@/services/review.service';
import { useReviewSocket } from '@/hooks/useReviewSocket';
import type { Review, ReviewSortOption, ReviewBreakdown } from '@/types/review';

type ReviewQueryData = {
    data?: {
        reviews: Review[];
        total: number;
        totalPages: number;
        ratingBreakdown: ReviewBreakdown;
    };
};

interface ReviewListProps {
    productId: string;
    ratingAvg?: number;
    ratingCount?: number;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'helpful', label: 'Hữu ích nhất' },
    { value: 'highest', label: 'Sao cao nhất' },
    { value: 'lowest', label: 'Sao thấp nhất' },
];

function StarFilterButton({
    star,
    count,
    active,
    onClick,
}: {
    star: number;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            variant={active ? 'filled' : 'default'}
            size="xs"
            radius="xl"
            onClick={onClick}
            leftSection={<IconStar size={12} />}
        >
            {star} sao {count > 0 && `(${count})`}
        </Button>
    );
}

function RatingBreakdown({
    breakdown,
    total,
    ratingAvg,
    onFilter,
    activeFilter,
}: {
    breakdown: ReviewBreakdown;
    total: number;
    ratingAvg: number;
    onFilter: (star: number | undefined) => void;
    activeFilter: number | undefined;
}) {
    return (
        <Paper withBorder radius="md" p="md">
            <Group gap="xl" wrap="nowrap" align="flex-start">
                {/* Avg score */}
                <Stack align="center" gap={4} style={{ minWidth: 80 }}>
                    <Title order={1} style={{ fontSize: 48, lineHeight: 1, color: 'var(--mantine-color-orange-6)' }}>
                        {ratingAvg.toFixed(1)}
                    </Title>
                    <Rating value={ratingAvg} readOnly fractions={2} size="sm" />
                    <Text size="xs" c="dimmed">{total} đánh giá</Text>
                </Stack>

                <Divider orientation="vertical" />

                {/* Breakdown bars */}
                <Stack gap={6} flex={1}>
                    {([5, 4, 3, 2, 1] as const).map(star => {
                        const count = breakdown[star] ?? 0;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                            <Group key={star} gap="xs" wrap="nowrap">
                                <Group gap={4} w={50} wrap="nowrap" justify="flex-end">
                                    <Text size="xs" c="dimmed">{star}</Text>
                                    <IconStar size={12} color="var(--mantine-color-orange-5)" fill="var(--mantine-color-orange-5)" />
                                </Group>
                                <Progress
                                    value={pct}
                                    color="orange"
                                    size="md"
                                    radius="xl"
                                    flex={1}
                                />
                                <Text size="xs" c="dimmed" w={32} ta="right">{count}</Text>
                            </Group>
                        );
                    })}
                </Stack>
            </Group>

            <Divider my="sm" />
            <Group gap="xs" wrap="wrap">
                <Button
                    variant={activeFilter === undefined ? 'filled' : 'default'}
                    size="xs"
                    radius="xl"
                    onClick={() => onFilter(undefined)}
                >
                    Tất cả
                </Button>
                {([5, 4, 3, 2, 1] as const).map(star => (
                    <StarFilterButton
                        key={star}
                        star={star}
                        count={breakdown[star] ?? 0}
                        active={activeFilter === star}
                        onClick={() => onFilter(star)}
                    />
                ))}
            </Group>
        </Paper>
    );
}

function MediaLightbox({
    items,
    startIndex,
    onClose,
}: {
    items: { src: string; type: 'image' | 'video' }[];
    startIndex: number;
    onClose: () => void;
}) {
    const [idx, setIdx] = useState(startIndex);
    const item = items[idx];
    return (
        <Modal
            opened
            onClose={onClose}
            size="xl"
            centered
            padding={0}
            withCloseButton
            styles={{ body: { padding: 0, background: '#000' } }}
        >
            <Box style={{ position: 'relative', background: '#000', minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.src}
                        alt="Review media"
                        style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                    />
                ) : (
                    <video
                        src={item.src}
                        controls
                        autoPlay
                        style={{ maxWidth: '100%', maxHeight: '70vh' }}
                    />
                )}
            </Box>
            {items.length > 1 && (
                <Group justify="center" p="sm" style={{ background: '#111' }} gap="xs">
                    {items.map((it, i) => (
                        <Box
                            key={i}
                            onClick={() => setIdx(i)}
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 6,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: i === idx ? '2px solid var(--mantine-color-orange-5)' : '2px solid transparent',
                                flexShrink: 0,
                            }}
                        >
                            {it.type === 'image' ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video src={it.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </Box>
                    ))}
                </Group>
            )}
        </Modal>
    );
}

function ReviewCard({
    review,
    voted,
    onToggleHelpful,
}: {
    review: Review;
    voted: boolean;
    onToggleHelpful: (id: string) => void;
}) {
    const displayName = review.user.profile?.displayName ?? 'Người dùng ẩn danh';
    const avatar = review.user.profile?.avatar;
    const initials = displayName.slice(0, 2).toUpperCase();

    const mediaItems = [
        ...review.images.map(src => ({ src, type: 'image' as const })),
        ...review.videos.map(src => ({ src, type: 'video' as const })),
    ];
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

    return (
        <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
                {/* Header */}
                <Group gap="sm" justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        <Avatar src={avatar} radius="xl" size="md" color="orange">
                            {initials}
                        </Avatar>
                        <Box>
                            <Text fw={600} size="sm">{displayName}</Text>
                            <Text size="xs" c="dimmed">{timeAgo(review.createdAt)}</Text>
                        </Box>
                    </Group>
                    {review.isVerified && (
                        <Badge
                            size="xs"
                            variant="light"
                            color="green"
                            leftSection={<IconShield size={10} />}
                        >
                            Đã mua
                        </Badge>
                    )}
                </Group>

                {/* Stars */}
                <Rating value={review.rating} readOnly size="sm" />

                {/* Comment */}
                {review.comment && (
                    <Text size="sm" style={{ lineHeight: 1.6 }}>{review.comment}</Text>
                )}

                {/* Ảnh + video grid */}
                {mediaItems.length > 0 && (
                    <SimpleGrid
                        cols={{ base: 2, xs: 3, sm: Math.min(mediaItems.length, 5) }}
                        spacing="xs"
                    >
                        {mediaItems.map((item, i) => (
                            <Box
                                key={i}
                                style={{
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    aspectRatio: '1 / 1',
                                    background: '#000',
                                }}
                                onClick={() => setLightboxIdx(i)}
                            >
                                {item.type === 'image' ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.src}
                                        alt={`Ảnh review ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                ) : (
                                    <>
                                        <video
                                            src={item.src}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            preload="metadata"
                                        />
                                        {/* Play overlay */}
                                        <Box
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'rgba(0,0,0,0.35)',
                                            }}
                                        >
                                            <Box
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.9)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
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
                    <MediaLightbox
                        items={mediaItems}
                        startIndex={lightboxIdx}
                        onClose={() => setLightboxIdx(null)}
                    />
                )}

                {/* Helpful */}
                <Group gap="xs" pt={4}>
                    <ActionIcon
                        variant={voted ? 'filled' : 'subtle'}
                        color={voted ? 'blue' : 'gray'}
                        size="sm"
                        radius="xl"
                        onClick={() => onToggleHelpful(review.id)}
                        title={voted ? 'Bỏ vote hữu ích' : 'Đánh dấu hữu ích'}
                    >
                        <IconThumbUp size={14} />
                    </ActionIcon>
                    <Text size="xs" c={voted ? 'blue' : 'dimmed'}>
                        {review.helpfulCount > 0
                            ? `${review.helpfulCount} người thấy hữu ích`
                            : 'Hữu ích?'}
                    </Text>
                </Group>
            </Stack>
        </Paper>
    );
}

export function ReviewList({ productId, ratingAvg = 0, ratingCount = 0 }: ReviewListProps) {
    const queryClient = useQueryClient();
    const [sort, setSort] = useState<ReviewSortOption>('newest');
    const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [liveRating, setLiveRating] = useState({ avg: ratingAvg, count: ratingCount });
    // Track reviews đã vote locally (optimistic UI)
    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

    const { data, isLoading } = useQuery({
        queryKey: ['reviews', productId, { sort, rating: filterRating, page }],
        queryFn: () =>
            reviewService.getByProduct(productId, { sort, rating: filterRating, page, limit: 10 }),
    });

    const helpfulMutation = useMutation({
        mutationFn: (reviewId: string) => reviewService.toggleHelpful(reviewId),
        onMutate: (reviewId) => {
            // Optimistic UI
            setVotedIds(prev => {
                const next = new Set(prev);
                if (next.has(reviewId)) next.delete(reviewId);
                else next.add(reviewId);
                return next;
            });
        },
        onSuccess: (result, reviewId) => {
            // Sync với server count
            const serverData = (result as { data?: { helpfulCount: number; voted: boolean } })?.data;
            if (!serverData) return;
            setVotedIds(prev => {
                const next = new Set(prev);
                if (serverData.voted) next.add(reviewId);
                else next.delete(reviewId);
                return next;
            });
            void queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
        },
        onError: (_err, reviewId) => {
            // Rollback
            setVotedIds(prev => {
                const next = new Set(prev);
                if (next.has(reviewId)) next.delete(reviewId);
                else next.add(reviewId);
                return next;
            });
        },
    });

    const handleNewReview = useCallback(
        (review: Review) => {
            queryClient.setQueryData(
                ['reviews', productId, { sort: 'newest', rating: undefined, page: 1 }],
                (old: ReviewQueryData | undefined) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            reviews: [review, ...old.data.reviews],
                            total: (old.data.total ?? 0) + 1,
                        },
                    };
                },
            );
        },
        [queryClient, productId],
    );

    const handleRatingUpdated = useCallback((updated: { ratingAvg: number; ratingCount: number }) => {
        setLiveRating({ avg: updated.ratingAvg, count: updated.ratingCount });
    }, []);

    useReviewSocket({ productId, onNewReview: handleNewReview, onRatingUpdated: handleRatingUpdated });

    const reviewData = (data as ReviewQueryData)?.data;
    const reviews = reviewData?.reviews ?? [];
    const breakdown = reviewData?.ratingBreakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const totalPages = reviewData?.totalPages ?? 1;

    const currentAvg = liveRating.avg || ratingAvg;
    const currentCount = liveRating.count || ratingCount;

    return (
        <Stack gap="md">
            {/* Tiêu đề section */}
            <Group gap="xs">
                <ThemeIcon variant="light" color="orange" size="md" radius="xl">
                    <IconStar size={16} />
                </ThemeIcon>
                <Title order={4}>Đánh giá sản phẩm</Title>
                {currentCount > 0 && (
                    <Badge variant="light" color="orange" radius="xl">
                        {currentCount} đánh giá
                    </Badge>
                )}
            </Group>

            {/* Rating breakdown */}
            {currentCount > 0 && (
                <RatingBreakdown
                    breakdown={breakdown}
                    total={currentCount}
                    ratingAvg={currentAvg}
                    onFilter={star => {
                        setFilterRating(star);
                        setPage(1);
                    }}
                    activeFilter={filterRating}
                />
            )}

            {/* Sort control */}
            {reviews.length > 0 && (
                <Group justify="space-between" wrap="wrap" gap="xs">
                    <Text size="sm" c="dimmed">
                        {(reviewData?.total ?? 0)} đánh giá
                        {filterRating ? ` ${filterRating} sao` : ''}
                    </Text>
                    <SegmentedControl
                        value={sort}
                        onChange={v => {
                            setSort(v as ReviewSortOption);
                            setPage(1);
                        }}
                        data={SORT_OPTIONS}
                        size="xs"
                        radius="xl"
                    />
                </Group>
            )}

            {/* Reviews */}
            {isLoading ? (
                <Center py="xl">
                    <Loader size="sm" />
                </Center>
            ) : reviews.length === 0 ? (
                <Paper withBorder radius="md" p="xl" ta="center">
                    <ThemeIcon size={48} radius="xl" variant="light" color="gray" mb="md">
                        <IconMoodEmpty size={24} />
                    </ThemeIcon>
                    <Text c="dimmed" size="sm">
                        {filterRating
                            ? `Chưa có đánh giá ${filterRating} sao`
                            : 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}
                    </Text>
                </Paper>
            ) : (
                <Stack gap="sm">
                    {reviews.map(review => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            voted={votedIds.has(review.id)}
                            onToggleHelpful={id => helpfulMutation.mutate(id)}
                        />
                    ))}
                </Stack>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Group justify="center" gap="xs">
                    <Button
                        variant="default"
                        size="xs"
                        radius="xl"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Trước
                    </Button>
                    <Text size="sm" c="dimmed">{page} / {totalPages}</Text>
                    <Button
                        variant="default"
                        size="xs"
                        radius="xl"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Sau
                    </Button>
                </Group>
            )}
        </Stack>
    );
}
