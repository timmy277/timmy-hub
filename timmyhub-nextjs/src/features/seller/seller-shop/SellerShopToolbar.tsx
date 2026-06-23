'use client';

/**
 * Thanh tìm kiếm trong cửa hàng + chia sẻ (sticky dưới AppShell header).
 */
import type { ReactElement } from 'react';
import Link from 'next/link';
import { ActionIcon, Group, Text, TextInput, ThemeIcon } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';

interface SellerShopToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onShare: () => void;
    onMore: () => void;
}

export function SellerShopToolbar({
    searchQuery,
    onSearchChange,
    onShare,
    onMore,
}: SellerShopToolbarProps): ReactElement {
    const { t } = useTranslation('common');

    return (
        <div
            suppressHydrationWarning
            className="sticky top-[60px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
        >
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-3 md:gap-6 md:px-8">
                <Link href="/" className="flex shrink-0 items-center gap-2 text-[#238be7] no-underline">
                    <ThemeIcon size="md" radius="md" color="blue" variant="filled">
                        <Iconify icon="solar:shop-bold" width={20} />
                    </ThemeIcon>
                    <Text fw={800} size="lg" c="dark" className="dark:text-slate-100">
                        TimmyHub
                    </Text>
                </Link>

                <TextInput
                    className="min-w-[200px] flex-1"
                    placeholder={t('sellerShop.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.currentTarget.value)}
                    leftSection={<Iconify icon="tabler:search" width={18} className="text-slate-400" />}
                    radius="md"
                    size="md"
                />

                <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                        variant="default"
                        size="lg"
                        radius="md"
                        aria-label={t('sellerShop.shareAria')}
                        onClick={onShare}
                    >
                        <Iconify icon="tabler:share-2" width={20} />
                    </ActionIcon>
                    <ActionIcon
                        variant="default"
                        size="lg"
                        radius="md"
                        aria-label={t('sellerShop.moreAria')}
                        onClick={onMore}
                    >
                        <Iconify icon="tabler:dots" width={20} />
                    </ActionIcon>
                </Group>
            </div>
        </div>
    );
}
