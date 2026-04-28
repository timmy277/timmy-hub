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
                border: '1px solid var(--mantine-color-default-border)',
            }}
            component="section"
            aria-labelledby="app-promo-title"
        >
            <Grid gutter={0} suppressHydrationWarning>
                <Grid.Col span={{ base: 12, md: 6 }} suppressHydrationWarning>
                    <Box style={{ position: 'relative', height: 280 }}>
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
                        p={40}
                        gap={16}
                        style={{ background: '#1c252e', minHeight: 280 }}
                    >
                        <Text
                            size="xs"
                            fw={700}
                            style={{
                                color: '#00a76f',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }}
                            component="span"
                        >
                            {t('footerPromo.appExclusive')}
                        </Text>
                        <Title
                            id="app-promo-title"
                            order={2}
                            c="white"
                            style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}
                        >
                            {t('footerPromo.title')}
                        </Title>
                        <Text c="white" size="sm" style={{ opacity: 0.72, maxWidth: 360 }}>
                            {t('footerPromo.desc')}
                        </Text>
                        <Group mt={8} gap={12}>
                            <Button
                                radius={50}
                                style={{ background: '#fff', color: '#1c252e', fontWeight: 700 }}
                                aria-label={t('footerPromo.appStoreAria')}
                            >
                                {t('footerPromo.appStore')}
                            </Button>
                            <Button
                                radius={50}
                                variant="outline"
                                style={{ borderColor: 'rgba(255,255,255,0.32)', color: '#fff' }}
                                aria-label={t('footerPromo.googlePlayAria')}
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
