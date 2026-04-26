'use client';

import { SimpleGrid, Group, Text, Stack, Box } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { memo } from 'react';

const FEATURES = [
    { icon: 'solar:delivery-bold', title: 'Miễn phí vận chuyển', desc: 'Cho đơn từ 199.000đ' },
    { icon: 'solar:shield-check-bold', title: 'Bảo hành chính hãng', desc: 'Cam kết 100%' },
    { icon: 'solar:headphones-round-sound-bold', title: 'Hỗ trợ 24/7', desc: 'Hotline: 1900 1234' },
    { icon: 'solar:clock-circle-bold', title: 'Giao hàng nhanh', desc: 'Nội thành trong 2h' },
];

function FeatureSectionComponent() {
    return (
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            {FEATURES.map((f) => (
                <Box
                    key={f.title}
                    p="md"
                    style={{
                        borderRadius: 12,
                        border: '1px solid var(--mantine-color-default-border)',
                        background: 'var(--mantine-color-body)',
                    }}
                >
                    <Group gap="sm" align="flex-start">
                        <Box
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: 'rgba(0,167,111,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Iconify icon={f.icon} width={22} color="#00a76f" />
                        </Box>
                        <Stack gap={2}>
                            <Text fw={600} size="sm" style={{ color: '#1c252e' }}>{f.title}</Text>
                            <Text size="xs" c="dimmed">{f.desc}</Text>
                        </Stack>
                    </Group>
                </Box>
            ))}
        </SimpleGrid>
    );
}

export const FeatureSection = memo(FeatureSectionComponent);
