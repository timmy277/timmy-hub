'use client';

import { Center, Loader, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface LoadingFallbackProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingFallback({ message, size = 'md' }: LoadingFallbackProps) {
    const { t } = useTranslation();
    const defaultMessage = t('common.loading', 'Loading...');

    return (
        <Center style={{ minHeight: '400px' }}>
            <Stack align="center" gap="md">
                <Loader size={size} />
                {(message ?? true) && (
                    <Text size="sm" c="dimmed">
                        {message === undefined ? defaultMessage : message}
                    </Text>
                )}
            </Stack>
        </Center>
    );
}

// Skeleton components for specific pages
export function ProductListSkeleton() {
    const { t } = useTranslation();
    return <LoadingFallback message={t('products.loading', 'Loading products...')} size="lg" />;
}

export function UserListSkeleton() {
    const { t } = useTranslation();
    return <LoadingFallback message={t('users.loading', 'Loading users...')} size="lg" />;
}

export function DashboardSkeleton() {
    const { t } = useTranslation();
    return <LoadingFallback message={t('dashboard.loading', 'Loading dashboard...')} size="xl" />;
}
