'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { sellerService, type SellerProfileStatus } from '@/services/seller.service';
import { DashboardShell } from '@/components/layout';
import { Box, Loader, Center } from '@mantine/core';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [checking, setChecking] = useState(true);
    const [hasSellerProfile, setHasSellerProfile] = useState<boolean | null>(null);
    const [status, setStatus] = useState<SellerProfileStatus | null>(null);

    const isBecomePage = pathname === '/seller/become';
    const isApproved = status === 'APPROVED';
    const isPending = status === 'PENDING';
    const sellerOnlyPaths = ['/seller/products', '/seller/vouchers', '/seller/campaigns'];

    useEffect(() => {
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
    }, [isAuthenticated, user, pathname, router]);

    useEffect(() => {
        if (!checking && hasSellerProfile === false && !isBecomePage) {
            router.replace('/seller/become');
            return;
        }
        if (!checking && isPending && sellerOnlyPaths.some(p => pathname.startsWith(p))) {
            router.replace('/seller');
        }
    }, [checking, hasSellerProfile, isPending, isBecomePage, pathname, router]);

    if (!isAuthenticated || checking) {
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

    if (isBecomePage) {
        return <>{children}</>;
    }

    return (
        <Box style={{ minHeight: '100vh' }}>
            <DashboardShell withFooter={true}>{children}</DashboardShell>
        </Box>
    );
}
