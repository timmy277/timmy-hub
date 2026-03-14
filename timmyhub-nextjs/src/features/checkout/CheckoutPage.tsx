'use client';

import {
    Container,
    Title,
    Text,
    Stack,
    Group,
    Button,
    Paper,
    Image,
    Divider,
    Box,
    Loader,
    Alert,
    TextInput,
    Modal,
    ScrollArea,
    ThemeIcon,
    Badge,
    Flex,
    CopyButton,
    Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { voucherService } from '@/services/voucher.service';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    const ax = err as { response?: { data?: { message?: string } } };
    const apiMessage = ax.response?.data?.message;
    if (typeof apiMessage === 'string') return apiMessage;
    return 'Có lỗi xảy ra, vui lòng thử lại';
}

type CartItem = {
    id: string;
    product: { price: number | string; name: string; images?: string[] };
    quantity: number;
};

type Voucher = {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    validFrom?: string;
    validUntil?: string;
};

type UserVoucher = {
    id: string;
    status: 'SAVED' | 'USED' | 'EXPIRED';
    voucher: Voucher;
};

type AnyRes = Record<string, unknown>;

async function buildPaymentUrl(
    cartItems: CartItem[],
    refetchCart: () => Promise<{ data?: { items?: CartItem[] } }>,
    voucherCode?: string,
): Promise<{ paymentUrl: string } | null> {
    const { data: freshCart } = await refetchCart();
    const items = (freshCart as { items?: CartItem[] } | undefined)?.items ?? cartItems;
    if (!items?.length) return null;

    const orderRes = (await orderService.createFromCart({
        paymentMethod: 'VNPAY',
        voucherCode,
    })) as unknown as AnyRes;
    const orderData = (orderRes as { data?: { id?: string } }).data;
    if (!orderData?.id) {
        const msg = (orderRes as { message?: string }).message;
        throw new Error(msg !== undefined ? msg : 'Tạo đơn hàng thất bại');
    }

    const payRes = (await paymentService.createVnpayUrl({
        orderId: orderData.id,
    })) as unknown as AnyRes;
    const payData = (payRes as { data?: { url?: string } }).data;
    if (!payData?.url) {
        const msg = (payRes as { message?: string }).message;
        throw new Error(msg !== undefined ? msg : 'Tạo link thanh toán thất bại');
    }

    return { paymentUrl: payData.url };
}

function isVoucherUsable(voucher: Voucher, totalAmount: number): { usable: boolean; reason?: string } {
    const now = new Date();
    if (voucher.validFrom && new Date(voucher.validFrom) > now) {
        return { usable: false, reason: 'Chưa đến ngày áp dụng' };
    }
    if (voucher.validUntil && new Date(voucher.validUntil) < now) {
        return { usable: false, reason: 'Đã hết hạn' };
    }
    if (voucher.minOrderValue && totalAmount < voucher.minOrderValue) {
        return { usable: false, reason: `Đơn tối thiểu ${voucher.minOrderValue.toLocaleString()}đ` };
    }
    return { usable: true };
}

function formatDiscount(voucher: Voucher): string {
    if (voucher.type === 'PERCENTAGE') {
        return `${voucher.value}%`;
    }
    return `${voucher.value.toLocaleString()}đ`;
}

function getVoucherColor(voucher: Voucher): string {
    if (voucher.type === 'PERCENTAGE' && voucher.value >= 50) return 'red';
    if (voucher.type === 'FIXED_AMOUNT' && voucher.value >= 100000) return 'red';
    return 'blue';
}

export function CheckoutPage() {
    const { user, isAuthenticated } = useAuth();
    const { cart, isLoading: cartLoading, refetch: refetchCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(
        null,
    );
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [voucherModalOpened, { open: openVoucherModal, close: closeVoucherModal }] = useDisclosure(false);

    // Fetch user's saved vouchers
    const { data: vouchersRes, isLoading: vouchersLoading } = useQuery({
        queryKey: ['my-vouchers', 'SAVED'],
        queryFn: () => voucherService.getMyVouchers('SAVED'),
        enabled: isAuthenticated,
    });

    const myVouchers: UserVoucher[] = vouchersRes?.data || [];

    const totalAmount = cart?.items?.reduce(
        (sum: number, item: CartItem) => sum + Number(item.product.price) * item.quantity,
        0,
    ) || 0;

    const handlePayWithVnpay = async () => {
        if (!cart || cart.items.length === 0) return;
        setIsSubmitting(true);
        let result: { paymentUrl: string } | null = null;
        try {
            result = await buildPaymentUrl(
                cart.items as CartItem[],
                refetchCart as () => Promise<{ data?: { items?: CartItem[] } }>,
                appliedVoucher?.code,
            );
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: getErrorMessage(err),
                color: 'red',
            });
            setIsSubmitting(false);
            return;
        }
        if (!result) {
            notifications.show({
                title: 'Giỏ hàng đã thay đổi',
                message: 'Giỏ hàng trống hoặc đã được cập nhật. Vui lòng kiểm tra lại giỏ hàng.',
                color: 'orange',
            });
            setIsSubmitting(false);
            return;
        }
        window.location.href = result.paymentUrl;
        setIsSubmitting(false);
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setIsApplyingVoucher(true);
        try {
            const res = await voucherService.validate(voucherCode.trim(), 'VNPAY');
            if (res.data?.valid) {
                setAppliedVoucher({
                    code: res.data.code ?? voucherCode.trim(),
                    discount: res.data.discount ?? 0,
                });
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã áp dụng mã giảm giá',
                    color: 'green',
                });
            } else {
                notifications.show({
                    title: 'Không thể áp dụng',
                    message: res.data?.message || 'Voucher không hợp lệ',
                    color: 'red',
                });
                setAppliedVoucher(null);
            }
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: getErrorMessage(err),
                color: 'red',
            });
            setAppliedVoucher(null);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleSelectVoucher = async (userVoucher: UserVoucher) => {
        const check = isVoucherUsable(userVoucher.voucher, totalAmount);
        if (!check.usable) {
            notifications.show({
                title: 'Không thể sử dụng',
                message: check.reason,
                color: 'orange',
            });
            return;
        }

        try {
            const res = await voucherService.validate(userVoucher.voucher.code, 'VNPAY');
            if (res.data?.valid) {
                setAppliedVoucher({
                    code: res.data.code ?? userVoucher.voucher.code,
                    discount: res.data.discount ?? 0,
                });
                closeVoucherModal();
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã áp dụng mã giảm giá',
                    color: 'green',
                });
            } else {
                notifications.show({
                    title: 'Không thể áp dụng',
                    message: res.data?.message || 'Voucher không hợp lệ',
                    color: 'red',
                });
            }
        } catch (err) {
            notifications.show({
                title: 'Lỗi',
                message: getErrorMessage(err),
                color: 'red',
            });
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
    };

    if (!user || cartLoading) {
        return (
            <Container size="lg" py="xl">
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                    <Text>Đang tải...</Text>
                </Group>
            </Container>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Container size="lg" py="xl">
                <Paper p="xl" withBorder>
                    <Alert icon={<Iconify icon="tabler:alert-circle" width={18} />} title="Giỏ hàng trống" color="blue">
                        Bạn chưa có sản phẩm nào để thanh toán. Vui lòng thêm sản phẩm vào giỏ hàng
                        trước.
                    </Alert>
                    <Button component={Link} href="/cart" mt="md">
                        Xem giỏ hàng
                    </Button>
                </Paper>
            </Container>
        );
    }

    const itemCount = cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="xl">
                Thanh toán
            </Title>

            <Group align="flex-start" gap="xl">
                <Stack style={{ flex: 1 }} gap="md">
                    <Paper p="md" withBorder>
                        <Text fw={600} mb="sm">
                            Sản phẩm ({itemCount})
                        </Text>
                        <Stack gap="sm">
                            {cart.items.map(item => (
                                <Group key={item.id} gap="sm">
                                    <Image
                                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                        alt={item.product.name}
                                        w={56}
                                        h={56}
                                        fit="cover"
                                        radius="sm"
                                    />
                                    <Box style={{ flex: 1 }}>
                                        <Text size="sm" fw={500}>
                                            {item.product.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {item.quantity} x{' '}
                                            {Number(item.product.price).toLocaleString()}đ
                                        </Text>
                                    </Box>
                                    <Text size="sm" fw={600}>
                                        {(
                                            Number(item.product.price) * item.quantity
                                        ).toLocaleString()}
                                        đ
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>

                <Paper p="lg" withBorder style={{ width: 360, position: 'sticky', top: 80 }}>
                    <Title order={4} mb="md">
                        Tóm tắt
                    </Title>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" c="dimmed">
                                Tạm tính ({itemCount} sp):
                            </Text>
                            <Text fw={600}>{totalAmount.toLocaleString()}đ</Text>
                        </Group>

                        {/* Voucher Section */}
                        <Box my="sm">
                            <Group align="flex-end" gap="sm">
                                <TextInput
                                    style={{ flex: 1 }}
                                    placeholder="Mã giảm giá"
                                    value={voucherCode}
                                    onChange={e => setVoucherCode(e.currentTarget.value)}
                                    disabled={!!appliedVoucher || isApplyingVoucher}
                                    leftSection={<Iconify icon="tabler:discount-2" width={16} />}
                                />
                                {appliedVoucher ? (
                                    <Button
                                        variant="light"
                                        color="red"
                                        onClick={handleRemoveVoucher}
                                    >
                                        Hủy
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleApplyVoucher}
                                        loading={isApplyingVoucher}
                                        disabled={!voucherCode.trim()}
                                    >
                                        Áp dụng
                                    </Button>
                                )}
                            </Group>

                            {!appliedVoucher && myVouchers.length > 0 && (
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    mt="xs"
                                    leftSection={<Iconify icon="tabler:ticket" width={14} />}
                                    onClick={openVoucherModal}
                                >
                                    Chọn từ voucher của bạn
                                </Button>
                            )}

                            {appliedVoucher && (
                                <Text size="sm" c="green" mt="xs">
                                    Đã giảm: -{appliedVoucher.discount.toLocaleString()}đ
                                </Text>
                            )}
                        </Box>

                        <Divider />
                        <Group justify="space-between">
                            <Text fw={600}>Tổng cộng:</Text>
                            <Text size="lg" fw={700} c="blue">
                                {Math.max(
                                    0,
                                    totalAmount - (appliedVoucher?.discount || 0),
                                ).toLocaleString()}
                                đ
                            </Text>
                        </Group>
                    </Stack>

                    <Button
                        size="md"
                        fullWidth
                        mt="lg"
                        leftSection={<Iconify icon="tabler:credit-card" width={18} />}
                        onClick={handlePayWithVnpay}
                        loading={isSubmitting}
                    >
                        Thanh toán qua VNPay
                    </Button>

                    <Button component={Link} href="/cart" variant="light" fullWidth mt="sm">
                        Quay lại giỏ hàng
                    </Button>
                </Paper>
            </Group>

            {/* Voucher Selection Modal */}
            <Modal
                opened={voucherModalOpened}
                onClose={closeVoucherModal}
                title="Chọn voucher"
                size="md"
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {vouchersLoading ? (
                    <Group justify="center" py="md">
                        <Loader size="sm" />
                    </Group>
                ) : myVouchers.length === 0 ? (
                    <Text c="dimmed" ta="center" py="md">
                        Bạn chưa có voucher nào
                    </Text>
                ) : (
                    <ScrollArea.Autosize mah={400}>
                        <Stack gap="sm">
                            {myVouchers.map(uv => {
                                const voucher = uv.voucher;
                                const { usable, reason } = isVoucherUsable(voucher, totalAmount);
                                const color = getVoucherColor(voucher);

                                return (
                                    <Paper
                                        key={uv.id}
                                        p="sm"
                                        withBorder
                                        style={{
                                            cursor: usable ? 'pointer' : 'not-allowed',
                                            opacity: usable ? 1 : 0.6,
                                        }}
                                        onClick={() => usable && handleSelectVoucher(uv)}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <Stack gap={2} style={{ flex: 1 }}>
                                                <Group gap="xs">
                                                    <Badge color={color} variant="light">
                                                        {formatDiscount(voucher)}
                                                    </Badge>
                                                    {voucher.minOrderValue && voucher.minOrderValue > 0 && (
                                                        <Text size="xs" c="dimmed">
                                                            Tối thiểu {voucher.minOrderValue.toLocaleString()}đ
                                                        </Text>
                                                    )}
                                                </Group>
                                                <Text size="sm" fw={600}>
                                                    {voucher.code}
                                                </Text>
                                                {voucher.maxDiscount && (
                                                    <Text size="xs" c="dimmed">
                                                        Giảm tối đa {voucher.maxDiscount.toLocaleString()}đ
                                                    </Text>
                                                )}
                                                {!usable && reason && (
                                                    <Text size="xs" c="red">
                                                        {reason}
                                                    </Text>
                                                )}
                                            </Stack>
                                            <Group gap="xs">
                                                <CopyButton value={voucher.code}>
                                                    {({ copied, copy }) => (
                                                        <Tooltip label={copied ? 'Đã copy' : 'Copy'}>
                                                            <Button
                                                                size="xs"
                                                                variant="subtle"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    copy();
                                                                }}
                                                            >
                                                                {copied ? <Iconify icon="tabler:check" width={14} /> : <Iconify icon="tabler:copy" width={14} />}
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </CopyButton>
                                                {usable && (
                                                    <ThemeIcon size={24} radius="xl" color="green" variant="light">
                                                        <Iconify icon="tabler:check" width={14} />
                                                    </ThemeIcon>
                                                )}
                                                {!usable && (
                                                    <ThemeIcon size={24} radius="xl" color="gray" variant="light">
                                                        <Iconify icon="tabler:x" width={14} />
                                                    </ThemeIcon>
                                                )}
                                            </Group>
                                        </Flex>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </ScrollArea.Autosize>
                )}
            </Modal>
        </Container>
    );
}
