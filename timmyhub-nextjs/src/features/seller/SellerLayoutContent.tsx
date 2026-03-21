'use client';

/**
 * Seller Layout - Guard + Shell cho tất cả trang /seller/*
 * User chưa có gian hàng: redirect sang /become-seller (UserLayout).
 */
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { sellerService, type SellerProfileStatus } from '@/services/seller.service';
import { DashboardShell } from '@/components/layout';
import { Loader, Center } from '@mantine/core';
import { BECOME_SELLER_PATH } from '@/constants/become-seller';

const SELLER_ONLY_PATHS = ['/seller/products', '/seller/vouchers', '/seller/campaigns'];

export function SellerLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const [checking, setChecking] = useState(true);
    const [hasSellerProfile, setHasSellerProfile] = useState<boolean | null>(null);
    const [status, setStatus] = useState<SellerProfileStatus | null>(null);

    const isPending = status === 'PENDING';

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated || !user) {
            router.replace('/login?redirect=' + encodeURIComponent(pathname || '/seller'));
            return;
        }
        sellerService
            .checkProfile()
            .then(res => {
                setHasSellerProfile(res.data?.hasSellerProfile ?? false);
                setStatus(res.data?.status ?? null);
            })
            .catch(() => {
                setHasSellerProfile(false);
                setStatus(null);
            })
            .finally(() => setChecking(false));
    }, [_hasHydrated, isAuthenticated, user, pathname, router]);

    useEffect(() => {
        if (!checking && hasSellerProfile === false) {
            router.replace(BECOME_SELLER_PATH);
            return;
        }
        if (!checking && isPending && SELLER_ONLY_PATHS.some(p => pathname.startsWith(p))) {
            router.replace('/seller');
        }
    }, [checking, hasSellerProfile, isPending, pathname, router]);

    if (!_hasHydrated || !isAuthenticated || checking) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    if (hasSellerProfile === false) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    return <DashboardShell withFooter={false}>{children}</DashboardShell>;
}
