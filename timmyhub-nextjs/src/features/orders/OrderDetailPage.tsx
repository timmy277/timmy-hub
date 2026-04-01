'use client';

/**
 * Trang chi tiết đơn hàng — hiển thị thông tin + nút đánh giá khi đơn DELIVERED
 */
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Container,
    Title,
    Text,
    Paper,
    Stack,
    Group,
    Image,
    Badge,
    Button,
    Divider,
    Loader,
    ThemeIcon,
    Box,
    Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import type { Order, OrderItem } from '@/types/order';
import { QUERY_KEYS } from '@/constants';
import { ReviewModal } from '@/features/reviews';
import { useTranslation } from 'react-i18next';
import { formatVND } from '@/utils/currency';

const ORDER_STATUS_MAP: Record<string, { labelKey: string; color: string }> = {
    PENDING: { labelKey: 'orderDetail.statusPending', color: 'yellow' },
    CONFIRMED: { labelKey: 'orderDetail.statusConfirmed', color: 'blue' },
    PROCESSING: { labelKey: 'orderDetail.statusProcessing', color: 'blue' },
    PACKED: { labelKey: 'orderDetail.statusPacked', color: 'teal' },
    SHIPPING: { labelKey: 'orderDetail.statusShipping', color: 'orange' },
    DELIVERED: { labelKey: 'orderDetail.statusDelivered', color: 'green' },
    COMPLETED: { labelKey: 'orderDetail.statusCompleted', color: 'green' },
    CANCELLED: { labelKey: 'orderDetail.statusCancelled', color: 'red' },
    RETURN_REQUESTED: { labelKey: 'orderDetail.statusReturnRequested', color: 'orange' },
    RETURNED: { labelKey: 'orderDetail.statusReturned', color: 'gray' },
    REFUNDED: { labelKey: 'orderDetail.statusRefunded', color: 'gray' },
};

interface ReviewTarget {
    orderItemId: string;
    productId: string;
    productName: string;
    productImage?: string | null;
}

function OrderItemRow({
    item,
    canReview,
    onReview,
}: {
    item: OrderItem;
    canReview: boolean;
    onReview: (target: ReviewTarget) => void;
}) {
    const { t } = useTranslation();
    return (
        <Group gap="md" wrap="nowrap" py="sm">
            <Image
                src={item.image || '/placeholder-product.jpg'}
                alt={item.name}
                w={72}
                h={72}
                fit="cover"
                radius="md"
            />
            <Stack gap={4} flex={1}>
                <Text fw={500} size="sm" lineClamp={2}>{item.name}</Text>
                <Text size="xs" c="dimmed">
                    {item.quantity} x {formatVND(Number(item.price))}
                </Text>
            </Stack>
            <Stack gap="xs" align="flex-end">
                <Text fw={700} size="sm">
                    {formatVND(Number(item.subtotal))}
                </Text>
                {canReview && !item.isReviewed && (
                    <Button
                        size="xs"
                        radius="xl"
                        variant="light"
                        color="orange"
                        leftSection={<Iconify icon="tabler:star" width={12} />}
                        onClick={() =>
                            onReview({
                                orderItemId: item.id,
                                productId: item.productId,
                                productName: item.name,
                                productImage: item.image,
                            })
                        }
                    >
                        {t('orderDetail.reviewBtn')}
                    </Button>
                )}
                {item.isReviewed && (
                    <Badge size="xs" variant="light" color="green" leftSection={<Iconify icon="tabler:check" width={10} />}>
                        {t('orderDetail.reviewedBadge')}
                    </Badge>
                )}
            </Stack>
        </Group>
    );
}

export function OrderDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const orderId = params.id as string;
    const queryClient = useQueryClient();

    const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
    const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

    const { data: orderRes, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.ORDER(orderId),
        queryFn: () => orderService.getOrder(orderId),
        enabled: !!orderId,
    });

    const order = (orderRes as { data?: Order })?.data;
    const terminalStatuses = ['COMPLETED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
    const canConfirmReceived =
        order?.paymentStatus === 'COMPLETED' &&
        !terminalStatuses.includes(order.status);
    const isCompleted = order?.status === 'COMPLETED';

    const confirmMutation = useMutation({
        mutationFn: () => orderService.confirmReceived(orderId),
        onSuccess: () => {
            closeConfirm();
            notifications.show({
                title: t('orderDetail.confirmSuccess'),
                message: t('orderDetail.confirmSuccessMsg'),
                color: 'green',
                icon: <Iconify icon="tabler:check" width={16} />,
            });
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(orderId) });
        },
        onError: () => {
            notifications.show({
                title: t('orderDetail.confirmError'),
                message: t('orderDetail.confirmErrorMsg'),
                color: 'red',
            });
        },
    });

    if (isLoading || !orderId) {
        return (
            <Container size="md" py="xl">
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                    <Text>{t('orderDetail.loading')}</Text>
                </Group>
            </Container>
        );
    }

    if (error || !order) {
        return (
            <Container size="md" py="xl">
                <Paper p="xl" withBorder ta="center">
                    <Text c="dimmed">{t('orderDetail.notFound')}</Text>
                    <Button component={Link} href="/" mt="md">
                        {t('orderDetail.backHome')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    const items = order.orderItems ?? [];
    const total = Number(order.totalAmount);
    const statusInfo = ORDER_STATUS_MAP[order.status] ?? { labelKey: order.status, color: 'gray' };
    const pendingReviewCount = isCompleted ? items.filter(i => !i.isReviewed).length : 0;

    return (
        <Container size="md" py="xl">
            {/* Header */}
            <Group justify="space-between" mb="xl" wrap="wrap" gap="sm">
                <Box>
                    <Title order={2}>{t('orderDetail.orderTitle', { id: order.id.slice(-8).toUpperCase() })}</Title>
                    <Text size="sm" c="dimmed" mt={4}>
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </Text>
                </Box>
                <Badge size="lg" variant="light" color={statusInfo.color}>
                    {t(statusInfo.labelKey, order.status)}
                </Badge>
            </Group>

            {/* Banner: xác nhận nhận hàng */}
            {canConfirmReceived && (
                <Paper withBorder radius="md" p="md" mb="md">
                    <Group gap="sm" justify="space-between" wrap="wrap">
                        <Group gap="sm">
                            <ThemeIcon color="teal" variant="light" size="md" radius="xl">
                                <Iconify icon="tabler:truck" width={16} />
                            </ThemeIcon>
                            <Box>
                                <Text fw={600} size="sm">{t('orderDetail.confirmReceivedQuestion')}</Text>
                                <Text size="xs" c="dimmed">
                                    {t('orderDetail.confirmReceivedDesc')}
                                </Text>
                            </Box>
                        </Group>
                        <Button
                            size="sm"
                            radius="xl"
                            color="teal"
                            leftSection={<Iconify icon="tabler:check" width={14} />}
                            onClick={openConfirm}
                            loading={confirmMutation.isPending}
                        >
                            {t('orderDetail.confirmReceivedBtn')}
                        </Button>
                    </Group>
                </Paper>
            )}

            {/* Banner: review CTA sau khi COMPLETED */}
            {pendingReviewCount > 0 && (
                <Paper withBorder radius="md" p="md" mb="md">
                    <Group gap="sm">
                        <ThemeIcon color="orange" variant="light" size="md" radius="xl">
                            <Iconify icon="tabler:star-filled" width={16} />
                        </ThemeIcon>
                        <Box flex={1}>
                            <Text fw={600} size="sm">{t('orderDetail.reviewBannerTitle')}</Text>
                            <Text size="xs" c="dimmed">
                                {t('orderDetail.reviewBannerDesc', { count: pendingReviewCount })}
                            </Text>
                        </Box>
                    </Group>
                </Paper>
            )}

            {/* Order info */}
            <Paper p="lg" withBorder mb="md" radius="md">
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('orderDetail.paymentStatus')}</Text>
                        <Text fw={600}>{order.paymentStatus}</Text>
                    </Group>
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('orderDetail.paymentMethod')}</Text>
                        <Text fw={600}>{order.paymentMethod}</Text>
                    </Group>
                </Stack>
            </Paper>

            {/* Products */}
            <Paper p="lg" withBorder radius="md">
                <Text fw={600} mb="xs">{t('orderDetail.products', { count: items.length })}</Text>
                <Stack gap={0}>
                    {items.map((item, idx) => (
                        <Box key={item.id}>
                            {idx > 0 && <Divider />}
                            <OrderItemRow
                                item={item}
                                canReview={isCompleted}
                                onReview={setReviewTarget}
                            />
                        </Box>
                    ))}
                </Stack>
                <Divider my="md" />
                <Group justify="space-between">
                    <Text size="lg" fw={700}>{t('orderDetail.total')}</Text>
                    <Text size="xl" fw={800} c="blue">
                        {formatVND(total)}
                    </Text>
                </Group>
            </Paper>

            <Group mt="lg" gap="sm">
                <Button component={Link} href="/profile/orders" variant="light">
                    {t('orders.myOrders', 'My Orders')}
                </Button>
                <Button component={Link} href="/" variant="subtle">
                    {t('orderDetail.backHome')}
                </Button>
            </Group>

            {/* Confirm received modal */}
            <Modal
                opened={confirmOpened}
                onClose={closeConfirm}
                title={
                    <Group gap="xs">
                        <ThemeIcon color="teal" variant="light" size="sm" radius="xl">
                            <Iconify icon="tabler:truck" width={14} />
                        </ThemeIcon>
                        <Text fw={700}>{t('orderDetail.confirmReceivedTitle')}</Text>
                    </Group>
                }
                centered
                size="sm"
                radius="lg"
                overlayProps={{ blur: 2 }}
            >
                <Stack gap="md">
                    <Paper withBorder radius="md" p="md" bg="yellow.0">
                        <Group gap="sm" align="flex-start">
                            <ThemeIcon color="yellow" variant="light" size="sm" radius="xl" mt={2}>
                                <Iconify icon="tabler:alert-triangle" width={14} />
                            </ThemeIcon>
                            <Text size="sm">
                                {t('orderDetail.confirmReceivedWarning')}{' '}
                                <Text span fw={700}>{t('orderDetail.confirmReceivedCannotUndo')}</Text>
                                {' '}{t('orderDetail.confirmReceivedComplete')}{' '}
                                <Text span fw={700} c="green">{t('orderDetail.confirmReceivedCompleted')}</Text>.
                            </Text>
                        </Group>
                    </Paper>
                    <Text size="sm" c="dimmed">
                        {t('orderDetail.confirmReceivedSatisfied')}
                    </Text>
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" radius="md" onClick={closeConfirm}>
                            {t('orderDetail.notReceivedBtn')}
                        </Button>
                        <Button
                            color="teal"
                            radius="md"
                            leftSection={<Iconify icon="tabler:check" width={14} />}
                            loading={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate()}
                        >
                            {t('orderDetail.confirmReceivedBtn')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Review Modal */}
            {reviewTarget && (
                <ReviewModal
                    opened={!!reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    productId={reviewTarget.productId}
                    productName={reviewTarget.productName}
                    productImage={reviewTarget.productImage}
                    orderItemId={reviewTarget.orderItemId}
                    onSuccess={() => {
                        setReviewTarget(null);
                        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER(orderId) });
                    }}
                />
            )}
        </Container>
    );
}
