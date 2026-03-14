'use client';

/**
 * Modal đánh giá sản phẩm sau khi mua hàng.
 * UI: chọn sao → comment → kéo thả ảnh/video → submit
 */
import { useState, useRef } from 'react';
import {
    Modal,
    Stack,
    Group,
    Text,
    Button,
    Textarea,
    Rating,
    Image,
    Badge,
    Paper,
    Title,
    ThemeIcon,
    Box,
    Transition,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Iconify from '@/components/iconify/Iconify';
import { reviewService } from '@/services/review.service';
import type { CreateReviewInput } from '@/types/review';
import { MediaUploader } from './MediaUploader';

const RATING_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: 'Rất tệ', color: 'red' },
    2: { label: 'Tệ', color: 'orange' },
    3: { label: 'Bình thường', color: 'yellow' },
    4: { label: 'Tốt', color: 'teal' },
    5: { label: 'Tuyệt vời!', color: 'green' },
};

interface ReviewModalProps {
    opened: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    productImage?: string | null;
    orderItemId: string;
    onSuccess?: () => void;
}

export function ReviewModal({
    opened,
    onClose,
    productId,
    productName,
    productImage,
    orderItemId,
    onSuccess,
}: ReviewModalProps) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const mediaRef = useRef<{ images: string[]; videos: string[] }>({ images: [], videos: [] });

    const mutation = useMutation({
        mutationFn: (data: CreateReviewInput) => reviewService.create(data),
        onSuccess: () => {
            setSubmitted(true);
            void queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            onSuccess?.();
        },
        onError: () => {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể gửi đánh giá. Vui lòng thử lại.',
                color: 'red',
            });
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            productId,
            orderItemId,
            rating,
            comment: comment.trim() || undefined,
            images: mediaRef.current.images,
            videos: mediaRef.current.videos,
        });
    };

    const handleClose = () => {
        if (!mutation.isPending) {
            setRating(5);
            setComment('');
            setSubmitted(false);
            mediaRef.current = { images: [], videos: [] };
            onClose();
        }
    };

    const ratingInfo = RATING_LABELS[rating];

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={
                <Group gap="xs">
                    <ThemeIcon variant="light" color="orange" size="sm" radius="xl">
                        <Iconify icon="tabler:star" width={14} />
                    </ThemeIcon>
                    <Text fw={700} size="md">Đánh giá sản phẩm</Text>
                </Group>
            }
            centered
            size="lg"
            radius="lg"
            overlayProps={{ blur: 3 }}
            scrollAreaComponent={undefined}
        >
            <Transition mounted={!submitted} transition="fade" duration={200}>
                {styles => (
                    <Stack gap="lg" style={styles}>
                        {/* Product info */}
                        <Paper withBorder radius="md" p="sm" bg="gray.0">
                            <Group gap="md" wrap="nowrap">
                                {productImage && (
                                    <Image
                                        src={productImage}
                                        w={64}
                                        h={64}
                                        radius="md"
                                        fit="cover"
                                        alt={productName}
                                    />
                                )}
                                <Box flex={1}>
                                    <Text fw={600} size="sm" lineClamp={2}>{productName}</Text>
                                    <Badge
                                        variant="light"
                                        color="green"
                                        size="xs"
                                        mt={4}
                                        leftSection={<Iconify icon="tabler:shopping-bag" width={10} />}
                                    >
                                        Đã mua
                                    </Badge>
                                </Box>
                            </Group>
                        </Paper>

                        {/* Rating stars */}
                        <Stack gap="xs" align="center">
                            <Text size="sm" c="dimmed" fw={500}>
                                Chất lượng sản phẩm như thế nào?
                            </Text>
                            <Rating
                                value={rating}
                                onChange={setRating}
                                size="xl"
                            />
                            <Transition mounted={rating > 0} transition="slide-up" duration={150}>
                                {badgeStyles => (
                                    <Badge
                                        variant="light"
                                        color={ratingInfo.color}
                                        size="lg"
                                        radius="xl"
                                        style={badgeStyles}
                                    >
                                        {ratingInfo.label}
                                    </Badge>
                                )}
                            </Transition>
                        </Stack>

                        {/* Comment */}
                        <Textarea
                            label="Nhận xét của bạn"
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (không bắt buộc)"
                            minRows={3}
                            maxRows={5}
                            autosize
                            value={comment}
                            onChange={e => setComment(e.currentTarget.value)}
                            maxLength={1000}
                            description={`${comment.length}/1000 ký tự`}
                            radius="md"
                        />

                        {/* Media upload */}
                        <MediaUploader
                            onMediaChange={(images, videos) => {
                                mediaRef.current = { images, videos };
                            }}
                        />

                        {/* Actions */}
                        <Group justify="flex-end" pt="xs">
                            <Button
                                variant="default"
                                radius="md"
                                onClick={handleClose}
                                disabled={mutation.isPending}
                            >
                                Để sau
                            </Button>
                            <Button
                                radius="md"
                                onClick={handleSubmit}
                                loading={mutation.isPending}
                                leftSection={<Iconify icon="tabler:star" width={16} />}
                                color="orange"
                            >
                                Gửi đánh giá
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Transition>

            {/* Success state */}
            <Transition mounted={submitted} transition="scale" duration={300}>
                {styles => (
                    <Stack align="center" gap="md" py="xl" style={styles}>
                        <ThemeIcon size={80} radius="xl" color="green" variant="light">
                            <Iconify icon="tabler:check" width={40} />
                        </ThemeIcon>
                        <Title order={3} ta="center">Cảm ơn bạn!</Title>
                        <Text c="dimmed" ta="center" size="sm">
                            Đánh giá của bạn đã được gửi và sẽ giúp người mua khác đưa ra quyết định tốt hơn.
                        </Text>
                        <Button radius="md" onClick={handleClose} color="orange">
                            Xong
                        </Button>
                    </Stack>
                )}
            </Transition>
        </Modal>
    );
}
