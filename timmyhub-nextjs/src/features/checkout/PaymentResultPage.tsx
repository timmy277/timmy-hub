'use client';

import { Suspense, useMemo, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import Iconify from '@/components/iconify/Iconify';
import { orderService } from '@/services/order.service';
import type { Order, OrderItem } from '@/types/order';
import { QUERY_KEYS } from '@/constants';
import { formatVND } from '@/utils/currency';

function toNumber(v: number | string | undefined | null): number {
    if (v === undefined || v === null) return 0;
    return typeof v === 'number' ? v : Number(v);
}

function PaymentResultContent(): ReactElement {
    const { t } = useTranslation('common');
    const searchParams = useSearchParams();
    const success = searchParams.get('success') === 'true';
    const orderId = searchParams.get('orderId') ?? '';
    const messageParam = searchParams.get('message');

    const { data: orderRes, isLoading: orderLoading, isError: orderError } = useQuery({
        queryKey: QUERY_KEYS.ORDER(orderId),
        queryFn: async () => {
            const res = await orderService.getOrder(orderId);
            return res.data as Order;
        },
        enabled: success && orderId.length > 0,
        retry: 1,
    });

    const order = orderRes;

    const itemsSubtotal = useMemo((): number => {
        if (!order?.orderItems?.length) return 0;
        return order.orderItems.reduce((sum: number, item: OrderItem) => sum + toNumber(item.subtotal), 0);
    }, [order?.orderItems]);

    const shippingFee = toNumber(order?.shippingFee);
    const voucherDiscount = toNumber(order?.voucherDiscount);
    const totalAmount = toNumber(order?.totalAmount);

    const handleDownloadInvoice = (): void => {
        notifications.show({
            message: t('paymentResult.invoiceSoon'),
            color: 'blue',
        });
    };

    const failureMessage =
        messageParam ??
        (success ? t('paymentResult.successSubtitle') : t('paymentResult.failureSubtitle'));

    if (!success) {
        return (
            <div className="flex w-full flex-1 justify-center bg-[#f6f7f8] px-4 py-10 dark:bg-[#111a21]">
                <Paper
                    className="w-full max-w-[600px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    p={0}
                >
                    <div className="flex flex-col items-center px-6 pb-10 pt-12">
                        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-red-500/10">
                            <Iconify icon="tabler:circle-x" className="text-red-500" width={56} stroke={2} />
                        </div>
                        <Title order={1} className="px-4 text-center text-2xl font-extrabold tracking-tight md:text-3xl">
                            {t('paymentResult.failureTitle')}
                        </Title>
                        <Text className="pt-2 text-center text-base text-slate-500 dark:text-slate-400">
                            {failureMessage}
                        </Text>
                        {orderId ? (
                            <div className="mt-4 rounded-full bg-slate-100 px-4 py-1.5 dark:bg-slate-800">
                                <Text size="sm" className="font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    {t('paymentResult.orderIdBadge', { id: orderId })}
                                </Text>
                            </div>
                        ) : null}
                        <Stack className="mt-10 w-full max-w-md gap-3" align="stretch">
                            {orderId ? (
                                <Button
                                    component={Link}
                                    href={`/profile/orders/${orderId}`}
                                    className="h-12 rounded-xl bg-[#238be7] font-bold text-white hover:bg-[#238be7]/90"
                                >
                                    {t('paymentResult.viewOrder')}
                                </Button>
                            ) : null}
                            <Button
                                component={Link}
                                href="/"
                                variant="light"
                                className="h-12 rounded-xl font-bold"
                            >
                                {t('paymentResult.backHome')}
                            </Button>
                        </Stack>
                    </div>
                </Paper>
            </div>
        );
    }

    if (success && orderId && orderLoading) {
        return (
            <div className="flex w-full flex-1 justify-center bg-[#f6f7f8] px-4 py-10 dark:bg-[#111a21]">
                <Paper className="w-full max-w-[600px] rounded-xl border border-slate-200 p-8 dark:border-slate-800">
                    <Stack gap="md" align="center">
                        <Skeleton height={96} circle />
                        <Skeleton height={28} width="80%" />
                        <Skeleton height={16} width="60%" />
                        <Skeleton height={120} width="100%" />
                    </Stack>
                    <Text size="sm" c="dimmed" ta="center" mt="md">
                        {t('paymentResult.loadingOrder')}
                    </Text>
                </Paper>
            </div>
        );
    }

    const displayOrderId = order?.id ?? orderId;
    const showSummary = Boolean(order?.orderItems?.length);

    return (
        <div className="flex w-full flex-1 justify-center bg-[#f6f7f8] px-4 py-10 dark:bg-[#111a21] lg:px-10">
            <div className="layout-content-container flex w-full max-w-[600px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col items-center pb-6 pt-12">
                    <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-emerald-500/10">
                        <Iconify icon="tabler:circle-check" className="text-[#22c55e]" width={56} stroke={2} />
                    </div>
                    <Title
                        order={1}
                        className="px-4 text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl"
                    >
                        {t('paymentResult.successTitle')}
                    </Title>
                    <Text className="px-4 pt-2 text-center text-base font-normal leading-normal text-slate-500 dark:text-slate-400">
                        {t('paymentResult.successSubtitle')}
                    </Text>
                    {displayOrderId ? (
                        <div className="mt-4 rounded-full bg-slate-100 px-4 py-1.5 dark:bg-slate-800">
                            <Text
                                size="sm"
                                className="font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300"
                            >
                                {t('paymentResult.orderIdBadge', { id: displayOrderId })}
                            </Text>
                        </div>
                    ) : null}
                </div>

                {showSummary && order ? (
                    <div className="px-8 pb-8">
                        <div className="my-6 border-t border-dashed border-slate-200 dark:border-slate-700" />
                        <Title order={3} className="pb-4 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {t('paymentResult.summaryTitle')}
                        </Title>
                        <div className="space-y-4">
                            {order.orderItems?.map((item: OrderItem) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <Iconify icon="tabler:photo" className="text-slate-400" width={28} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Text className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {item.name}
                                        </Text>
                                        <Text size="xs" className="text-slate-500 dark:text-slate-400">
                                            {t('paymentResult.quantity', { count: item.quantity })}
                                        </Text>
                                    </div>
                                    <Text className="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {formatVND(toNumber(item.subtotal))}
                                    </Text>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-2 border-t border-slate-100 pt-6 dark:border-slate-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t('paymentResult.subtotalLine')}</span>
                                <span className="text-slate-900 dark:text-slate-100">{formatVND(itemsSubtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t('checkout.shippingFee')}</span>
                                <span className="text-slate-900 dark:text-slate-100">{formatVND(shippingFee)}</span>
                            </div>
                            {voucherDiscount > 0 ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">{t('paymentResult.discountLine')}</span>
                                    <span className="text-[#22c55e]">-{formatVND(voucherDiscount)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between pt-2 text-lg font-extrabold">
                                <span className="text-slate-900 dark:text-slate-100">{t('checkout.total')}</span>
                                <span className="text-[#238be7]">{formatVND(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                ) : success && orderId && orderError ? (
                    <div className="px-8 pb-8">
                        <div className="my-6 border-t border-dashed border-slate-200 dark:border-slate-700" />
                        <Text size="sm" c="orange" className="text-center">
                            {t('paymentResult.loadOrderError')}
                        </Text>
                    </div>
                ) : null}

                <div className="flex flex-col gap-3 px-8 pb-8">
                    <Button
                        component={Link}
                        href="/"
                        className="h-12 rounded-xl bg-[#238be7] font-bold text-white hover:bg-[#238be7]/90"
                    >
                        {t('paymentResult.continueShopping')}
                    </Button>
                    <Button
                        type="button"
                        variant="light"
                        className="h-12 rounded-xl border-0 bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        leftSection={<Iconify icon="tabler:receipt" width={20} />}
                        onClick={handleDownloadInvoice}
                    >
                        {t('paymentResult.downloadInvoice')}
                    </Button>
                    {orderId ? (
                        <Button component={Link} href={`/profile/orders/${orderId}`} variant="subtle" className="font-semibold">
                            {t('paymentResult.viewOrder')}
                        </Button>
                    ) : null}
                </div>

                <div className="px-8 pb-10 text-center">
                    <Text size="xs" className="text-slate-400 dark:text-slate-500">
                        {t('paymentResult.footerNote')}
                    </Text>
                </div>
            </div>
        </div>
    );
}

export function PaymentResultPage(): ReactElement {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center bg-[#f6f7f8] px-4 py-16 dark:bg-[#111a21]">
                    <Skeleton height={320} className="w-full max-w-[600px]" radius="md" />
                </div>
            }
        >
            <PaymentResultContent />
        </Suspense>
    );
}
