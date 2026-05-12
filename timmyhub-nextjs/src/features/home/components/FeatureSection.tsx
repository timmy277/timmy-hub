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
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg" component="section" aria-label={t('featureSection.ariaLabel')} suppressHydrationWarning>
            {FEATURES.map((f) => (
                <Box
                    key={f.title}
                    p={24}
                    style={{
                        borderRadius: 12,
                        border: '1px solid #DFE3E8',
                        background: '#FFFFFF',
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                        transition: 'all 150ms ease',
                    }}
                    role="article"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.borderColor = '#C4CDD5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0px 1px 3px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = '#DFE3E8';
                    }}
                >
                    <Group gap="md" align="flex-start">
                        <Box
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: 'rgba(0,167,111,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                            aria-hidden="true"
                        >
                            <Iconify icon={f.icon} width={24} color="#00a76f" />
                        </Box>
                        <Stack gap={4}>
                            <Text
                                fw={700}
                                size="md"
                                style={{
                                    color: '#1c252e',
                                    fontFamily: 'Public Sans Variable, sans-serif',
                                    fontSize: 16,
                                }}
                                suppressHydrationWarning
                            >
                                {f.title}
                            </Text>
                            <Text
                                size="sm"
                                style={{
                                    color: '#637381',
                                    fontFamily: 'Public Sans Variable, sans-serif',
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                }}
                                suppressHydrationWarning
                            >
                                {f.desc}
                            </Text>
                        </Stack>
                    </Group>
                </Box>
            ))}
        </SimpleGrid>
    );
}

export const FeatureSection = memo(FeatureSectionComponent);
