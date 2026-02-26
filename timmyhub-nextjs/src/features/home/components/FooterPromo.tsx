'use client';

import { Card, Grid, Image, Badge, Title, Text, Stack, Group, Button } from '@mantine/core';
import { m } from 'framer-motion';

export function FooterPromo() {
    return (
        <m.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1 }}>
            <Card radius="lg" padding={0} withBorder mt="xl">
                <Grid gutter={0}>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Image alt="img" src="https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=2664&auto=format&fit=crop" h={300} fit="cover" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }} bg="blue.6">
                        <Stack align="flex-start" justify="center" h="100%" p={40}>
                            <Badge color="white" c="blue" size="lg">APP EXCLUSIVE</Badge>
                            <Title c="white" order={2}>Tải App TimmyHub Ngay!</Title>
                            <Text c="white" opacity={0.9}>Mua sắm tiện lợi hơn, nhận thêm voucher giảm giá 50% cho đơn hàng đầu tiên trên ứng dụng mobile.</Text>
                            <Group mt="md">
                                <Button variant="white" c="dark">App Store</Button>
                                <Button variant="outline" c="white" color="white">Google Play</Button>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>
        </m.div>
    );
}
