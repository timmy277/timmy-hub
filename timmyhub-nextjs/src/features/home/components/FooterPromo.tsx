'use client';

import { Box, Grid, Title, Text, Stack, Group, Button } from '@mantine/core';
import Image from 'next/image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

function FooterPromoComponent() {
    const { t } = useTranslation('common');
    return (
        <Box
            style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #DFE3E8',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            }}
            component="section"
            aria-labelledby="app-promo-title"
        >
            <Grid gutter={0} suppressHydrationWarning>
                <Grid.Col span={{ base: 12, md: 6 }} suppressHydrationWarning>
                    <Box style={{ position: 'relative', height: 320 }}>
                        <Image
                            alt={t('footerPromo.imageAlt')}
                            src="https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2664&auto=format&fit=crop"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: 'cover' }}
                        />
                    </Box>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }} suppressHydrationWarning>
                    <Stack
                        justify="center"
                        h="100%"
                        p={48}
                        gap={20}
                        style={{ background: '#1c252e', minHeight: 320 }}
                    >
                        <Text
                            size="sm"
                            fw={600}
                            style={{
                                color: '#00a76f',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontFamily: 'Public Sans Variable, sans-serif',
                                fontSize: 12,
                            }}
                            component="span"
                            suppressHydrationWarning
                        >
                            {t('footerPromo.appExclusive')}
                        </Text>
                        <Title
                            id="app-promo-title"
                            order={2}
                            c="white"
                            style={{
                                fontFamily: 'Barlow, sans-serif',
                                fontSize: 32,
                                fontWeight: 800,
                                lineHeight: 1.3,
                                letterSpacing: '-0.5px',
                            }}
                            suppressHydrationWarning
                        >
                            {t('footerPromo.title')}
                        </Title>
                        <Text
                            c="white"
                            size="md"
                            style={{
                                opacity: 0.8,
                                maxWidth: 400,
                                fontFamily: 'Public Sans Variable, sans-serif',
                                fontSize: 16,
                                lineHeight: 1.6,
                            }}
                            suppressHydrationWarning
                        >
                            {t('footerPromo.desc')}
                        </Text>
                        <Group mt={12} gap={12}>
                            <Button
                                radius={8}
                                size="md"
                                style={{
                                    background: '#fff',
                                    color: '#1c252e',
                                    fontWeight: 400,
                                    fontFamily: 'Public Sans Variable, sans-serif',
                                    fontSize: 16,
                                }}
                                aria-label={t('footerPromo.appStoreAria')}
                                suppressHydrationWarning
                            >
                                {t('footerPromo.appStore')}
                            </Button>
                            <Button
                                radius={8}
                                size="md"
                                variant="outline"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.32)',
                                    color: '#fff',
                                    fontWeight: 400,
                                    fontFamily: 'Public Sans Variable, sans-serif',
                                    fontSize: 16,
                                }}
                                aria-label={t('footerPromo.googlePlayAria')}
                                suppressHydrationWarning
                            >
                                {t('footerPromo.googlePlay')}
                            </Button>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Box>
    );
}

export const FooterPromo = memo(FooterPromoComponent);
