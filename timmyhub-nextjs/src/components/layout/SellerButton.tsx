'use client';

import { Button } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { BECOME_SELLER_PATH } from '@/constants/become-seller';
import { UserRole, User } from '@/types/auth';

interface SellerButtonProps {
    user: User | null | undefined;
}

export function SellerButton({ user }: SellerButtonProps) {
    const { t } = useTranslation();

    if (!user) return null;

    const isSeller = user.roles?.includes(UserRole.SELLER);
    const canBecomeSeller =
        user.roles?.includes(UserRole.CUSTOMER) ||
        user.roles?.includes(UserRole.BRAND) ||
        user.roles?.includes(UserRole.SHIPPER);

    if (isSeller) {
        return (
            <Button
                component={Link}
                href="/seller"
                variant="light"
                size="sm"
                leftSection={<Iconify icon="solar:shop-bold" width={18} />}
            >
                {t('appBar.myStore')}
            </Button>
        );
    }

    if (canBecomeSeller) {
        return (
            <Button
                component={Link}
                href={BECOME_SELLER_PATH}
                variant="default"
                size="sm"
                leftSection={<Iconify icon="solar:shop-bold" width={18} />}
            >
                {t('appBar.becomeSeller')}
            </Button>
        );
    }

    return null;
}
