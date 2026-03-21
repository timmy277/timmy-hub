'use client';

/**
 * Trang gian hàng công khai: toolbar, banner, tab, lưới sản phẩm, chân trang cửa hàng.
 */
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import {
    Container,
    Paper,
    Stack,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { SellerShop } from '@/types/product';
import { useChatStore } from '@/stores/useChatStore';
import {
    SELLER_SHOP_PAGE_SIZE,
    type SellerShopSortMode,
} from '@/constants/seller-shop-ui';
import {
    filterProductsByQuery,
    sortProductsByMode,
} from '@/features/sellers/utils/seller-shop-products';
import { SellerShopToolbar } from './seller-shop/SellerShopToolbar';
import { SellerShopHero } from './seller-shop/SellerShopHero';
import { SellerShopProductBlock } from './seller-shop/SellerShopProductBlock';
import { SellerShopFooter } from './seller-shop/SellerShopFooter';

interface SellerShopClientProps {
    shop: SellerShop;
}

export function SellerShopClient({ shop }: SellerShopClientProps): ReactElement {
    const { t } = useTranslation('common');
    const openChat = useChatStore((state) => state.openChat);
    const [search, setSearch] = useState('');
    const [sortMode, setSortMode] = useState<SellerShopSortMode>('popular');
    const [visibleCount, setVisibleCount] = useState(SELLER_SHOP_PAGE_SIZE);
    const [activeTab, setActiveTab] = useState<string | null>('home');

    const sellerDisplayName =
        shop.user.profile?.displayName ||
        `${shop.user.profile?.firstName ?? ''} ${shop.user.profile?.lastName ?? ''}`.trim() ||
        shop.shopName;

    const filtered = useMemo(
        () => filterProductsByQuery(shop.products, search),
        [shop.products, search],
    );

    const sorted = useMemo(
        () => sortProductsByMode(filtered, sortMode),
        [filtered, sortMode],
    );

    useEffect(() => {
        setVisibleCount(SELLER_SHOP_PAGE_SIZE);
    }, [search, sortMode, shop.id]);

    const handleShare = useCallback(async (): Promise<void> => {
        if (typeof window === 'undefined') return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            notifications.show({
                message: t('sellerShop.shareCopied'),
                color: 'green',
            });
        } catch {
            notifications.show({
                message: t('sellerShop.errorCopy'),
                color: 'red',
            });
        }
    }, [t]);

    const handleMore = useCallback((): void => {
        notifications.show({
            message: t('sellerShop.moreSoon'),
            color: 'blue',
        });
    }, [t]);

    const handleFollow = useCallback((): void => {
        notifications.show({
            message: t('sellerShop.followSoon'),
            color: 'blue',
        });
    }, [t]);

    const handleChat = useCallback((): void => {
        openChat({
            id: shop.userId,
            name: shop.shopName,
            avatar: (shop.shopLogo ?? shop.user.profile?.avatar) || null,
        });
    }, [openChat, shop.shopLogo, shop.shopName, shop.user.profile?.avatar, shop.userId]);

    const loadMore = useCallback((): void => {
        setVisibleCount((c) => c + SELLER_SHOP_PAGE_SIZE);
    }, []);

    const introText =
        shop.description?.trim() ||
        t('sellerShop.defaultIntro', { name: shop.shopName });

    return (
        <div
            suppressHydrationWarning
            className="min-h-[50vh] bg-[#f6f7f8] dark:bg-[#111a21]"
        >
            <SellerShopToolbar
                searchQuery={search}
                onSearchChange={setSearch}
                onShare={handleShare}
                onMore={handleMore}
            />

            <SellerShopHero
                shop={shop}
                sellerDisplayName={sellerDisplayName}
                onChat={handleChat}
                onFollow={handleFollow}
            />

            <Container size="xl" py="xl" className="max-w-[1280px]">
                <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                    <Tabs.List grow mb="lg" className="flex-wrap">
                        <Tabs.Tab value="home">{t('sellerShop.tabHome')}</Tabs.Tab>
                        <Tabs.Tab value="all">{t('sellerShop.tabAll')}</Tabs.Tab>
                        <Tabs.Tab value="reviews">{t('sellerShop.tabReviews')}</Tabs.Tab>
                        <Tabs.Tab value="policies">{t('sellerShop.tabPolicies')}</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="home">
                        <Stack gap="xl">
                            <Paper p="lg" radius="lg" withBorder shadow="xs">
                                <Title order={4} mb="sm">
                                    {t('sellerShop.homeIntroTitle')}
                                </Title>
                                <Text c="dimmed" size="sm">
                                    {introText}
                                </Text>
                            </Paper>
                            <SellerShopProductBlock
                                products={sorted}
                                sortMode={sortMode}
                                onSortModeChange={setSortMode}
                                visibleCount={visibleCount}
                                onLoadMore={loadMore}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="all">
                        <SellerShopProductBlock
                            products={sorted}
                            sortMode={sortMode}
                            onSortModeChange={setSortMode}
                            visibleCount={visibleCount}
                            onLoadMore={loadMore}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="reviews">
                        <Paper p="xl" radius="lg" withBorder>
                            <Title order={4} mb="sm">
                                {t('sellerShop.reviewsTitle')}
                            </Title>
                            <Text c="dimmed">{t('sellerShop.reviewsPlaceholder')}</Text>
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="policies">
                        <Paper p="xl" radius="lg" withBorder>
                            <Title order={4} mb="sm">
                                {t('sellerShop.policiesTitle')}
                            </Title>
                            <Text c="dimmed">{t('sellerShop.policiesBody')}</Text>
                        </Paper>
                    </Tabs.Panel>
                </Tabs>
            </Container>

            <SellerShopFooter shopName={shop.shopName} />
        </div>
    );
}
