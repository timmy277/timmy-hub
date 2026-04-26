'use client';

import { Skeleton, Stack, Group } from '@mantine/core';

const H = 'calc(100dvh - 60px)';

export function PostSkeleton() {
    return (
        <div style={{ position: 'relative', width: '100%', height: H, background: 'var(--mantine-color-dark-7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Action buttons skeleton - right side */}
            <Stack
                gap="lg"
                style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 80,
                    zIndex: 2
                }}
            >
                <Skeleton height={48} width={48} circle />
                <Skeleton height={48} width={48} circle />
                <Skeleton height={48} width={48} circle />
                <Skeleton height={48} width={48} circle />
            </Stack>

            {/* Post info skeleton - bottom left */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 80, zIndex: 2 }}>
                <Stack gap="xs">
                    <Group gap="xs">
                        <Skeleton height={32} width={32} circle />
                        <Skeleton height={20} width={120} />
                    </Group>
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={16} width="60%" />
                </Stack>
            </div>
        </div>
    );
}
