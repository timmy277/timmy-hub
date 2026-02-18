'use client';

import { Center, Loader, Stack, Text } from '@mantine/core';

interface LoadingFallbackProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingFallback({ message = 'Loading...', size = 'md' }: LoadingFallbackProps) {
    return (
        <Center style={{ minHeight: '400px' }}>
            <Stack align="center" gap="md">
                <Loader size={size} />
                {message && (
                    <Text size="sm" c="dimmed">
                        {message}
                    </Text>
                )}
            </Stack>
        </Center>
    );
}

// Skeleton components for specific pages
export function ProductListSkeleton() {
    return <LoadingFallback message="Loading products..." size="lg" />;
}

export function UserListSkeleton() {
    return <LoadingFallback message="Loading users..." size="lg" />;
}

export function DashboardSkeleton() {
    return <LoadingFallback message="Loading dashboard..." size="xl" />;
}
