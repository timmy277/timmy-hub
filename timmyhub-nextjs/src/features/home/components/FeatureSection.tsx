'use client';

import { SimpleGrid, Group, Text, Stack, Box } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

function FeatureSectionComponent() {
    const { t } = useTranslation('common');

    const FEATURES = [
        { icon: 'solar:delivery-bold', title: t('featureSection.freeShippingTitle'), desc: t('featureSection.freeShippingDesc') },
        { icon: 'solar:shield-check-bold', title: t('featureSection.warrantyTitle'), desc: t('featureSection.warrantyDesc') },
        { icon: 'solar:headphones-round-sound-bold', title: t('featureSection.supportTitle'), desc: t('featureSection.supportDesc') },
        { icon: 'solar:clock-circle-bold', title: t('featureSection.fastDeliveryTitle'), desc: t('featureSection.fastDeliveryDesc') },
    ];

    return (
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" component="section" aria-label={t('featureSection.ariaLabel')} suppressHydrationWarning>
            {FEATURES.map((f) => (
                <Box
                    key={f.title}
                    p="md"
                    style={{
                        borderRadius: 12,
                        border: '1px solid var(--mantine-color-default-border)',
                        background: 'var(--mantine-color-body)',
                    }}
                    role="article"
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
                            aria-hidden="true"
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
