'use client';

import { useState, useCallback } from 'react';
import {
    Stack,
    Group,
    Text,
    Button,
    Paper,
    SegmentedControl,
    Loader,
    Center,
    ThemeIcon,
    Title,
    Badge,
} from '@mantine/core';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Iconify from '@/components/iconify/Iconify';
import { reviewService } from '@/services/review.service';
import { useReviewSocket } from '@/hooks/useReviewSocket';
import type { Review, ReviewSortOption, ReviewBreakdown, ReviewComment } from '@/types/review';
import { ReviewCard } from './ReviewCard';
import { RatingBreakdown } from './RatingBreakdown';

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

export function ReviewList({ productId, ratingAvg = 0, ratingCount = 0 }: ReviewListProps) {
    const queryClient = useQueryClient();
    const [sort, setSort] = useState<ReviewSortOption>('newest');
    const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [liveRating, setLiveRating] = useState({ avg: ratingAvg, count: ratingCount });
    const [optimisticVotes, setOptimisticVotes] = useState<Record<string, boolean>>({});

    const { data, isLoading } = useQuery({
        queryKey: ['reviews', productId, { sort, rating: filterRating, page }],
        queryFn: () =>
            reviewService.getByProduct(productId, { sort, rating: filterRating, page, limit: 10 }),
    });

    const helpfulMutation = useMutation({
        mutationFn: (reviewId: string) => reviewService.toggleHelpful(reviewId),
        onMutate: async (reviewId) => {
            await queryClient.cancelQueries({ queryKey: ['reviews', productId] });
            const previousData = queryClient.getQueryData(['reviews', productId]);

            setOptimisticVotes(prev => {
                const reviewData = (data as ReviewQueryData)?.data;
                const review = reviewData?.reviews?.find(r => r.id === reviewId);
                const currentStatus = prev[reviewId] ?? review?.hasVotedHelpful ?? false;
                return { ...prev, [reviewId]: !currentStatus };
            });

            return { previousData };
        },
        onSuccess: (result, reviewId) => {
            const serverData = (result as { data?: { helpfulCount: number; voted: boolean } })?.data;
            if (serverData) {
                setOptimisticVotes(prev => ({ ...prev, [reviewId]: serverData.voted }));
            }
            void queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
        },
        onError: (_err, reviewId, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['reviews', productId], context.previousData);
            }
            setOptimisticVotes(prev => {
                const next = { ...prev };
                delete next[reviewId];
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

    const handleNewComment = useCallback((data: { reviewId: string; comment: ReviewComment }) => {
        queryClient.setQueryData(
            ['reviews', productId, { sort, rating: filterRating, page }],
            (old: ReviewQueryData | undefined) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        reviews: old.data.reviews.map(r => {
                            if (r.id !== data.reviewId) return r;

                            if (!data.comment.parentId) {
                                return { ...r, comments: [...(r.comments || []), data.comment] };
                            }

                            return {
                                ...r,
                                comments: (r.comments || []).map(cmt =>
                                    cmt.id === data.comment.parentId
                                        ? { ...cmt, replies: [...(cmt.replies || []), data.comment] }
                                        : cmt
                                ),
                            };
                        }),
                    },
                };
            },
        );
    }, [queryClient, productId, sort, filterRating, page]);

    useReviewSocket({
        productId,
        onNewReview: handleNewReview,
        onRatingUpdated: handleRatingUpdated,
        onNewComment: handleNewComment,
    });

    const reviewData = (data as ReviewQueryData)?.data;
    const reviews = reviewData?.reviews ?? [];
    const breakdown = reviewData?.ratingBreakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const totalPages = reviewData?.totalPages ?? 1;

    const currentAvg = liveRating.avg || ratingAvg;
    const currentCount = liveRating.count || ratingCount;

    return (
        <Stack gap="md">
            {/* Header section */}
            <Group gap="xs">
                <ThemeIcon variant="light" color="orange" size="md" radius="xl">
                    <Iconify icon="tabler:star" width={16} />
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

            {/* Reviews list */}
            {isLoading ? (
                <Center py="xl">
                    <Loader size="sm" />
                </Center>
            ) : reviews.length === 0 ? (
                <Paper withBorder radius="md" p="xl" ta="center">
                    <ThemeIcon size={48} radius="xl" variant="light" color="gray" mb="md">
                        <Iconify icon="tabler:mood-empty" width={24} />
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
                            voted={optimisticVotes[review.id] ?? review.hasVotedHelpful ?? false}
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
