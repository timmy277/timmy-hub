'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Alert,
    Group,
    Image,
    Loader,
    Modal,
    Paper,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title,
    Badge,
    Flex,
    CopyButton,
    Tooltip,
    Radio,
    Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import Iconify from '@/components/iconify/Iconify';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS, DEFAULT_SHIPPING_FEE_VND } from '@/constants';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { voucherService } from '@/services/voucher.service';
import { addressService } from '@/services/address.service';
import type { Address } from '@/types/address';
import type { PaymentMethod } from '@/types/order';
import type { CartItem } from '@/types/cart';
import Link from 'next/link';
import { formatVND } from '@/utils/currency';

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    const ax = err as { response?: { data?: { message?: string } } };
    const apiMessage = ax.response?.data?.message;
    if (typeof apiMessage === 'string') return apiMessage;
    return 'Error';
}

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

type AppliedVoucher = {
    code: string;
    discount: number;
    type?: string;
};

type CheckoutPayment = 'COD' | 'VNPAY';

function formatAddressOneLine(a: Address): string {
    const tail = [a.ward, a.district, a.city].filter(Boolean).join(', ');
    return [a.addressLine1, a.addressLine2, tail].filter(Boolean).join(', ');
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
        return { usable: false, reason: `Đơn tối thiểu ${formatVND(voucher.minOrderValue)}` };
    }
    return { usable: true };
}

function formatDiscount(voucher: Voucher): string {
    if (voucher.type === 'PERCENTAGE') {
        return `${voucher.value}%`;
    }
    if (voucher.type === 'FREE_SHIPPING') {
        return 'Freeship';
    }
    return `${formatVND(voucher.value)}`;
}

function getVoucherColor(voucher: Voucher): string {
    if (voucher.type === 'PERCENTAGE' && voucher.value >= 50) return 'red';
    if (voucher.type === 'FIXED_AMOUNT' && voucher.value >= 100000) return 'red';
    return 'blue';
}

export function CheckoutPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { cart, isLoading: cartLoading, refetch: refetchCart } = useCart();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [paymentChoice, setPaymentChoice] = useState<CheckoutPayment>('VNPAY');
    const [customerNote, setCustomerNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [voucherModalOpened, { open: openVoucherModal, close: closeVoucherModal }] = useDisclosure(false);

    const { data: addresses = [], isLoading: addressesLoading } = useQuery({
        queryKey: QUERY_KEYS.MY_ADDRESSES,
        queryFn: async () => {
            const res = await addressService.list();
            return res.data ?? [];
        },
        enabled: isAuthenticated,
    });

    const { data: vouchersRes, isLoading: vouchersLoading } = useQuery({
        queryKey: ['my-vouchers', 'SAVED'],
        queryFn: () => voucherService.getMyVouchers('SAVED'),
        enabled: isAuthenticated,
    });

    const myVouchers: UserVoucher[] = vouchersRes?.data || [];

    useEffect(() => {
        if (!selectedAddressId && addresses.length > 0) {
            const def = addresses.find(a => a.isDefault);
            setSelectedAddressId(def?.id ?? addresses[0]?.id ?? null);
        }
    }, [addresses, selectedAddressId]);

    const itemsSubtotal =
        cart?.items?.reduce(
            (sum: number, item: CartItem) => sum + Number(item.product.price) * item.quantity,
            0,
        ) ?? 0;

    const productDiscount = appliedVoucher?.discount ?? 0;
    const afterDiscount = Math.max(0, itemsSubtotal - productDiscount);

    const shippingFee = useMemo(() => {
        if (appliedVoucher?.type === 'FREE_SHIPPING') {
            return 0;
        }
        return DEFAULT_SHIPPING_FEE_VND;
    }, [appliedVoucher?.type]);

    const grandTotal = afterDiscount + shippingFee;

    const itemCount = cart?.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) ?? 0;

    const mapPaymentToApi = (): PaymentMethod => (paymentChoice === 'COD' ? 'COD' : 'VNPAY');

    const handleApplyVoucher = async (): Promise<void> => {
        if (!voucherCode.trim()) return;
        setIsApplyingVoucher(true);
        try {
            const res = await voucherService.validate(voucherCode.trim(), mapPaymentToApi());
            if (res.data?.valid) {
                setAppliedVoucher({
                    code: res.data.code ?? voucherCode.trim(),
                    discount: res.data.discount ?? 0,
                    type: res.data.type,
                });
                notifications.show({
                    title: t('common.success'),
                    message: t('common.saved'),
                    color: 'green',
                });
            } else {
                notifications.show({
                    title: t('common.error'),
                    message: res.data?.message || 'Invalid',
                    color: 'red',
                });
                setAppliedVoucher(null);
            }
        } catch (err) {
            notifications.show({
                title: t('common.error'),
                message: getErrorMessage(err),
                color: 'red',
            });
            setAppliedVoucher(null);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleSelectVoucher = async (userVoucher: UserVoucher): Promise<void> => {
        const check = isVoucherUsable(userVoucher.voucher, itemsSubtotal);
        if (!check.usable) {
            notifications.show({
                title: t('common.error'),
                message: check.reason ?? '',
                color: 'orange',
            });
            return;
        }
        try {
            const res = await voucherService.validate(userVoucher.voucher.code, mapPaymentToApi());
            if (res.data?.valid) {
                setAppliedVoucher({
                    code: res.data.code ?? userVoucher.voucher.code,
                    discount: res.data.discount ?? 0,
                    type: res.data.type,
                });
                closeVoucherModal();
                notifications.show({
                    title: t('common.success'),
                    message: t('common.saved'),
                    color: 'green',
                });
            } else {
                notifications.show({
                    title: t('common.error'),
                    message: res.data?.message || 'Invalid',
                    color: 'red',
                });
            }
        } catch (err) {
            notifications.show({
                title: t('common.error'),
                message: getErrorMessage(err),
                color: 'red',
            });
        }
    };

    const handleRemoveVoucher = (): void => {
        setAppliedVoucher(null);
        setVoucherCode('');
    };

    const handleConfirm = async (): Promise<void> => {
        if (!cart || cart.items.length === 0) return;
        if (!selectedAddressId) {
            notifications.show({
                title: t('common.error'),
                message: t('checkout.selectAddress'),
                color: 'orange',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const { data: freshCart } = await refetchCart();
            const items = freshCart?.items ?? [];
            if (!items.length) {
                notifications.show({
                    title: t('common.error'),
                    message: t('checkout.cartEmptyHint'),
                    color: 'orange',
                });
                setIsSubmitting(false);
                return;
            }

            const paymentMethod = mapPaymentToApi();
            const orderRes = await orderService.createFromCart({
                addressId: selectedAddressId,
                paymentMethod,
                voucherCode: appliedVoucher?.code,
                customerNote: customerNote.trim() || undefined,
            });

            const orderId = orderRes.data?.id;
            if (!orderId) {
                throw new Error(orderRes.message || 'Order failed');
            }

            if (paymentMethod === 'COD') {
                router.push(`/payment/result?success=true&orderId=${encodeURIComponent(orderId)}`);
                setIsSubmitting(false);
                return;
            }

            const payRes = await paymentService.createVnpayUrl({ orderId });
            const url = payRes.data?.url;
            if (!url) {
                throw new Error(payRes.message || 'VNPAY URL failed');
            }
            window.location.href = url;
        } catch (err) {
            notifications.show({
                title: t('common.error'),
                message: getErrorMessage(err),
                color: 'red',
            });
            setIsSubmitting(false);
        }
    };

    if (!user || cartLoading) {
        return (
            <div className="min-h-[50vh] bg-[#f6f7f8] dark:bg-[#111a21]">
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-24">
                    <Loader size="lg" />
                    <Text>{t('common.loading')}</Text>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-[50vh] bg-[#f6f7f8] dark:bg-[#111a21]">
                <div className="mx-auto max-w-7xl px-4 py-10">
                    <Paper p="xl" withBorder radius="md">
                        <Alert
                            icon={<Iconify icon="tabler:alert-circle" width={18} />}
                            title={t('checkout.cartEmpty')}
                            color="blue"
                        >
                            {t('checkout.cartEmptyHint')}
                        </Alert>
                        <Button component={Link} href="/cart" variant="light">
                            {t('checkout.viewCart')}
                        </Button>
                    </Paper>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f6f7f8] text-slate-900 dark:bg-[#111a21] dark:text-slate-100">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Stepper */}
                <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span className="flex items-center gap-2 text-slate-500">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs dark:bg-slate-800">
                            1
                        </span>
                        {t('checkout.stepShipping')}
                    </span>
                    <Iconify icon="tabler:chevron-right" className="text-slate-300" width={16} />
                    <span className="flex items-center gap-2 text-[#238be7]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#238be7] text-xs text-white">
                            2
                        </span>
                        {t('checkout.stepPayment')}
                    </span>
                    <Iconify icon="tabler:chevron-right" className="text-slate-300" width={16} />
                    <span className="flex items-center gap-2 text-slate-400">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs dark:bg-slate-800">
                            3
                        </span>
                        {t('checkout.stepConfirm')}
                    </span>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="space-y-8 lg:col-span-8">
                        {/* Địa chỉ */}
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                                <Title order={3} className="flex items-center gap-2 text-lg font-bold">
                                    <Iconify icon="tabler:map-pin" className="text-[#238be7]" width={22} />
                                    {t('checkout.shippingTitle')}
                                </Title>
                                <Button
                                    component="a"
                                    href="/profile/addresses"
                                    variant="subtle"
                                    size="xs"
                                    className="inline-flex items-center justify-center font-medium transition-all duration-150"
                                >
                                    + {t('checkout.addAddress')}
                                </Button>
                            </div>

                            {addressesLoading ? (
                                <Loader size="sm" />
                            ) : addresses.length === 0 ? (
                                <Alert color="orange">{t('checkout.noAddresses')}</Alert>
                            ) : (
                                <Radio.Group
                                    value={selectedAddressId ?? undefined}
                                    onChange={setSelectedAddressId}
                                >
                                    <Stack gap="md">
                                        {addresses.map(addr => (
                                            <Radio
                                                key={addr.id}
                                                value={addr.id}
                                                label={
                                                    <div className="ml-1 flex flex-col gap-1">
                                                        <div>
                                                            <Text component="span" fw={700}>
                                                                {addr.fullName}
                                                            </Text>{' '}
                                                            <Text component="span" c="dimmed" size="sm">
                                                                ({addr.phone})
                                                            </Text>
                                                        </div>
                                                        <Text size="sm" c="dimmed">
                                                            {formatAddressOneLine(addr)}
                                                        </Text>
                                                        {addr.isDefault && (
                                                            <Badge
                                                                size="xs"
                                                                variant="light"
                                                                color="blue"
                                                                className="w-fit"
                                                            >
                                                                {t('addresses.defaultBadge')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                }
                                                classNames={{
                                                    root: 'p-4 rounded-xl border-2 transition-all',
                                                    body: 'w-full',
                                                    label: 'w-full',
                                                }}
                                                styles={{
                                                    root: {
                                                        borderColor:
                                                            selectedAddressId === addr.id
                                                                ? '#238be7'
                                                                : 'var(--mantine-color-gray-3)',
                                                        background:
                                                            selectedAddressId === addr.id
                                                                ? 'rgba(35, 139, 231, 0.06)'
                                                                : undefined,
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Radio.Group>
                            )}
                        </section>

                        {/* Thanh toán */}
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <Title order={3} className="mb-6 flex items-center gap-2 text-lg font-bold">
                                <Iconify icon="tabler:credit-card" className="text-[#238be7]" width={22} />
                                {t('checkout.paymentTitle')}
                            </Title>

                            <Stack gap="sm">
                                <button
                                    type="button"
                                    onClick={() => setPaymentChoice('COD')}
                                    className={`group flex w-full items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 ${paymentChoice === 'COD'
                                        ? 'border-[#238be7] bg-[#238be7]/5'
                                        : 'border-slate-200'
                                        }`}
                                >
                                    <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${paymentChoice === 'COD'
                                            ? 'border-[#238be7] bg-white dark:bg-slate-900'
                                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                                            }`}
                                    >
                                        {paymentChoice === 'COD' ? (
                                            <span className="h-2 w-2 rounded-full bg-[#238be7]" />
                                        ) : null}
                                    </span>
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                        <Iconify icon="tabler:truck" className="text-slate-600 dark:text-slate-300" width={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {t('checkout.codTitle')}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('checkout.codFee')}
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentChoice('VNPAY')}
                                    className={`group flex w-full items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 ${paymentChoice === 'VNPAY'
                                        ? 'border-[#238be7] bg-[#238be7]/5'
                                        : 'border-slate-200'
                                        }`}
                                >
                                    <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${paymentChoice === 'VNPAY'
                                            ? 'border-[#238be7] bg-white dark:bg-slate-900'
                                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                                            }`}
                                    >
                                        {paymentChoice === 'VNPAY' ? (
                                            <span className="h-2 w-2 rounded-full bg-[#238be7]" />
                                        ) : null}
                                    </span>
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                                        <Iconify icon="tabler:building-bank" width={22} className="text-[#238be7]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {t('checkout.vnpayTitle')}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('checkout.vnpayHint')}
                                        </div>
                                    </div>
                                </button>

                                <div
                                    className="flex cursor-not-allowed items-center rounded-xl border border-dashed border-slate-200 p-4 opacity-60 dark:border-slate-700"
                                    title={t('checkout.momoDisabled')}
                                    aria-disabled
                                >
                                    <span className="mr-4 h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 opacity-50" aria-hidden />
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50">
                                            <Text fw={700} c="pink" size="sm">
                                                MoMo
                                            </Text>
                                        </div>
                                        <div>
                                            <Text fw={600}>{t('checkout.momoTitle')}</Text>
                                            <Text size="xs" c="dimmed">
                                                {t('checkout.momoHint')}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Stack>
                        </section>

                        {/* Ghi chú */}
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <Title order={3} className="mb-4 text-lg font-bold">
                                {t('checkout.noteTitle')}
                            </Title>
                            <Textarea
                                placeholder={t('checkout.notePlaceholder')}
                                rows={3}
                                value={customerNote}
                                onChange={e => setCustomerNote(e.currentTarget.value)}
                                radius="md"
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <Title order={3} className="mb-6 border-b border-slate-100 pb-4 text-lg font-bold dark:border-slate-800">
                                    {t('checkout.summaryTitle')}
                                </Title>

                                <div className="mb-6 space-y-4">
                                    {cart.items.map((item: CartItem) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                                <Image
                                                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                                    alt={item.product.name}
                                                    w={64}
                                                    h={64}
                                                    fit="cover"
                                                />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                                                <div>
                                                    <Text size="sm" fw={600} lineClamp={2}>
                                                        {item.product.name}
                                                    </Text>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Text size="xs">x{item.quantity}</Text>
                                                    <Text size="sm" fw={700}>
                                                        {formatVND(
                                                            Number(item.product.price) * item.quantity,
                                                        )}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-6 flex gap-2">
                                    <div className="relative min-w-0 flex-1">
                                        <Iconify
                                            icon="tabler:discount-2"
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            width={18}
                                        />
                                        <TextInput
                                            className="pl-10"
                                            placeholder={t('checkout.voucherPlaceholder')}
                                            value={voucherCode}
                                            onChange={e => setVoucherCode(e.currentTarget.value)}
                                            disabled={!!appliedVoucher || isApplyingVoucher}
                                            size="sm"
                                            radius="md"
                                        />
                                    </div>
                                    {appliedVoucher ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleRemoveVoucher}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => void handleApplyVoucher()}
                                            loading={isApplyingVoucher}
                                            disabled={!voucherCode.trim()}
                                            className="shrink-0 bg-slate-200 text-slate-900 hover:bg-[#238be7] hover:text-white dark:bg-slate-800"
                                        >
                                            {t('checkout.apply')}
                                        </Button>
                                    )}
                                </div>

                                {!appliedVoucher && myVouchers.length > 0 && (
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        mb="sm"
                                        leftSection={<Iconify icon="tabler:ticket" width={14} />}
                                        onClick={openVoucherModal}
                                    >
                                        {t('checkout.chooseSavedVoucher')}
                                    </Button>
                                )}

                                <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">
                                            {t('checkout.subtotal', { count: itemCount })}
                                        </Text>
                                        <Text size="sm" fw={500}>
                                            {formatVND(itemsSubtotal)}
                                        </Text>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">
                                            {t('checkout.shippingFee')}
                                        </Text>
                                        <Text size="sm" fw={500}>
                                            {shippingFee === 0
                                                ? `Miễn phí (${t('checkout.freeShipping')})`
                                                : formatVND(shippingFee)}
                                        </Text>
                                    </Group>
                                    {appliedVoucher && productDiscount > 0 && (
                                        <Group justify="space-between" className="font-medium text-green-600">
                                            <Text size="sm">{t('checkout.voucherDiscount')}</Text>
                                            <Text size="sm">-{formatVND(productDiscount)}</Text>
                                        </Group>
                                    )}
                                    <Group
                                        justify="space-between"
                                        className="mt-2 border-t border-slate-100 pt-4 dark:border-slate-800"
                                    >
                                        <Text className="text-lg font-bold">{t('checkout.total')}</Text>
                                        <Text className="text-xl font-black text-[#238be7]">
                                            {formatVND(grandTotal)}
                                        </Text>
                                    </Group>
                                    <Text size="10px" ta="right" c="dimmed" fs="italic">
                                        {t('checkout.vatNote')}
                                    </Text>
                                </div>

                                <Button
                                    fullWidth
                                    size="lg"
                                    mt="xl"
                                    className="bg-[#238be7] font-bold shadow-lg shadow-[#238be7]/20 hover:bg-[#238be7]/90"
                                    loading={isSubmitting}
                                    onClick={() => void handleConfirm()}
                                    disabled={!selectedAddressId || addresses.length === 0}
                                >
                                    {t('checkout.confirmCta')}
                                </Button>

                                <Group justify="center" gap="md" mt="lg" className="opacity-50 grayscale">
                                    <Iconify icon="tabler:shield-check" width={16} />
                                    <Text size="11px" fw={500} className="tracking-wider">
                                        {t('checkout.secureBadge')}
                                    </Text>
                                </Group>
                            </div>

                            <div className="flex gap-3 rounded-xl border border-[#238be7]/10 bg-[#238be7]/5 p-4">
                                <Iconify icon="tabler:info-circle" className="shrink-0 text-[#238be7]" width={20} />
                                <Text size="xs" className="leading-relaxed text-[#238be7]">
                                    {t('checkout.termsHintPre')}{' '}
                                    <Link href="/terms" className="font-medium underline hover:no-underline">
                                        {t('checkout.termsLink')}
                                    </Link>{' '}
                                    {t('checkout.termsAnd')}{' '}
                                    <Link href="/privacy" className="font-medium underline hover:no-underline">
                                        {t('checkout.privacyLink')}
                                    </Link>{' '}
                                    {t('checkout.termsHintSuf')}
                                </Text>
                            </div>

                            <Button component={Link} href="/cart" variant="light" fullWidth>
                                {t('checkout.backCart')}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Modal
                opened={voucherModalOpened}
                onClose={closeVoucherModal}
                title={t('checkout.chooseSavedVoucher')}
                size="md"
                scrollAreaComponent={ScrollArea.Autosize}
            >
                {vouchersLoading ? (
                    <Group justify="center" py="md">
                        <Loader size="sm" />
                    </Group>
                ) : myVouchers.length === 0 ? (
                    <Text c="dimmed" ta="center" py="md">
                        {t('common.noSavedVouchers')}
                    </Text>
                ) : (
                    <ScrollArea.Autosize mah={400}>
                        <Stack gap="sm">
                            {myVouchers.map(uv => {
                                const voucher = uv.voucher;
                                const { usable, reason } = isVoucherUsable(voucher, itemsSubtotal);
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
                                        onClick={() => usable && void handleSelectVoucher(uv)}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <Stack gap={2} style={{ flex: 1 }}>
                                                <Group gap="xs">
                                                    <Badge color={color} variant="light">
                                                        {formatDiscount(voucher)}
                                                    </Badge>
                                                </Group>
                                                <Text size="sm" fw={600}>
                                                    {voucher.code}
                                                </Text>
                                                {!usable && reason && (
                                                    <Text size="xs" c="red">
                                                        {reason}
                                                    </Text>
                                                )}
                                            </Stack>
                                            <CopyButton value={voucher.code}>
                                                {({ copied, copy }) => (
                                                    <Tooltip label={copied ? 'OK' : 'Copy'}>
                                                        <Button
                                                            size="xs"
                                                            variant="subtle"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                copy();
                                                            }}
                                                            className="inline-flex items-center justify-center font-medium transition-all duration-150"
                                                        >
                                                            {copied ? (
                                                                <Iconify icon="tabler:check" width={14} />
                                                            ) : (
                                                                <Iconify icon="tabler:copy" width={14} />
                                                            )}
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </CopyButton>
                                        </Flex>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </ScrollArea.Autosize>
                )}
            </Modal>
        </div>
    );
}
