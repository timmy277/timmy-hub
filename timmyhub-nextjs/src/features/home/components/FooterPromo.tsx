'use client';

import { Box, Grid, Image, Title, Text, Stack, Group, Button } from '@mantine/core';

export function FooterPromo() {
    return (
        <Box
            style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--mantine-color-default-border)',
            }}
        >
            <Grid gutter={0}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Image
                        alt="TimmyHub App"
                        src="https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2664&auto=format&fit=crop"
                        h={280}
                        fit="cover"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
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
                        >
                            App Exclusive
                        </Text>
                        <Title
                            order={2}
                            c="white"
                            style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}
                        >
                            Tải App TimmyHub Ngay!
                        </Title>
                        <Text c="white" size="sm" style={{ opacity: 0.72, maxWidth: 360 }}>
                            Mua sắm tiện lợi hơn, nhận thêm voucher giảm giá 50% cho đơn hàng đầu tiên trên ứng dụng mobile.
                        </Text>
                        <Group mt={8} gap={12}>
                            <Button
                                radius={50}
                                style={{ background: '#fff', color: '#1c252e', fontWeight: 700 }}
                            >
                                App Store
                            </Button>
                            <Button
                                radius={50}
                                variant="outline"
                                style={{ borderColor: 'rgba(255,255,255,0.32)', color: '#fff' }}
                            >
                                Google Play
                            </Button>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Box>
    );
}
