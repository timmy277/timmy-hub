'use client';

/**
 * Seller Layout - Guard + Shell cho tất cả trang /seller/*
 * /seller/become: render không có DashboardShell (standalone page)
 * Các trang còn lại: bọc bởi DashboardShell → chỉ cần code content bên trong
 */
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { sellerService, type SellerProfileStatus } from '@/services/seller.service';
import { DashboardShell } from '@/components/layout';
import { Loader, Center } from '@mantine/core';

const SELLER_ONLY_PATHS = ['/seller/products', '/seller/vouchers', '/seller/campaigns'];

export function SellerLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const [checking, setChecking] = useState(true);
    const [hasSellerProfile, setHasSellerProfile] = useState<boolean | null>(null);
    const [status, setStatus] = useState<SellerProfileStatus | null>(null);

    const isBecomePage = pathname === '/seller/become';
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
        if (!checking && hasSellerProfile === false && !isBecomePage) {
            router.replace('/seller/become');
            return;
        }
        if (!checking && isPending && SELLER_ONLY_PATHS.some(p => pathname.startsWith(p))) {
            router.replace('/seller');
        }
    }, [checking, hasSellerProfile, isPending, isBecomePage, pathname, router]);

    if (!_hasHydrated || !isAuthenticated || checking) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    if (hasSellerProfile === false && !isBecomePage) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        );
    }

    // /seller/become: không có sidebar/appbar, render standalone
    if (isBecomePage) {
        return <>{children}</>;
    }

    return <DashboardShell withFooter={false}>{children}</DashboardShell>;
}
