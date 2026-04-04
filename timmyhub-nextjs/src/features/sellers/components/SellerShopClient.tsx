'use client';

/**
 * Trang gian hàng công khai: toolbar, banner, tab, lưới sản phẩm, chân trang cửa hàng.
 */
import { useCallback, useMemo, useState, type ReactElement } from 'react';
import {
    Container,
    Paper,
    Stack,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import type { SellerShop } from '@/types/product';
import { useChatStore } from '@/stores/useChatStore';
import {
    SELLER_SHOP_PAGE_SIZE,
    type SellerShopSortMode,
} from '@/constants/seller-shop-ui';
import {
    sortProductsByMode,
} from '@/features/sellers/utils/seller-shop-products';
import { SellerShopHero } from './seller-shop/SellerShopHero';
import { SellerShopProductBlock } from './seller-shop/SellerShopProductBlock';
import { SellerShopFooter } from './seller-shop/SellerShopFooter';

interface SellerShopClientProps {
    shop: SellerShop;
}

export function SellerShopClient({ shop }: SellerShopClientProps): ReactElement {
    const { t } = useTranslation('common');
    const openChat = useChatStore((state) => state.openChat);
    const [sortMode, setSortMode] = useState<SellerShopSortMode>('popular');
    const [visibleCount, setVisibleCount] = useState(SELLER_SHOP_PAGE_SIZE);
    const [activeTab, setActiveTab] = useState<string | null>('home');

    const sellerDisplayName =
        shop.user.profile?.displayName ||
        `${shop.user.profile?.firstName ?? ''} ${shop.user.profile?.lastName ?? ''}`.trim() ||
        shop.shopName;

    const sorted = useMemo(
        () => sortProductsByMode(shop.products, sortMode),
        [shop.products, sortMode],
    );

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
        <div suppressHydrationWarning className="min-h-[50vh] bg-[#f6f7f8] dark:bg-[#111a21]">
            <SellerShopHero
                shop={shop}
                sellerDisplayName={sellerDisplayName}
                onChat={handleChat}
                onFollow={handleFollow}
            />

            <Container size="xl" py="xl" px="xl">
                <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="xl">
                    <Tabs.List mb="xl">
                        <Tabs.Tab value="home" leftSection={<Iconify icon="solar:home-2-bold" width={15} />}>{t('sellerShop.tabHome')}</Tabs.Tab>
                        <Tabs.Tab value="all" leftSection={<Iconify icon="solar:box-bold" width={15} />}>{t('sellerShop.tabAll')}</Tabs.Tab>
                        <Tabs.Tab value="reviews" leftSection={<Iconify icon="solar:star-bold" width={15} />}>{t('sellerShop.tabReviews')}</Tabs.Tab>
                        <Tabs.Tab value="policies" leftSection={<Iconify icon="solar:shield-check-bold" width={15} />}>{t('sellerShop.tabPolicies')}</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="home">
                        <Stack gap="xl">
                            <Paper p="lg" radius="md" withBorder shadow="xs">
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
                                onSortModeChange={(v) => {
                                    setSortMode(v);
                                    setVisibleCount(SELLER_SHOP_PAGE_SIZE);
                                }}
                                visibleCount={visibleCount}
                                onLoadMore={loadMore}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="all">
                        <SellerShopProductBlock
                            products={sorted}
                            sortMode={sortMode}
                            onSortModeChange={(v) => {
                                setSortMode(v);
                                setVisibleCount(SELLER_SHOP_PAGE_SIZE);
                            }}
                            visibleCount={visibleCount}
                            onLoadMore={loadMore}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="reviews">
                        <Paper p="xl" radius="md" withBorder>
                            <Title order={4} mb="sm">
                                {t('sellerShop.reviewsTitle')}
                            </Title>
                            <Text c="dimmed">{t('sellerShop.reviewsPlaceholder')}</Text>
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="policies">
                        <Paper p="xl" radius="md" withBorder>
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
