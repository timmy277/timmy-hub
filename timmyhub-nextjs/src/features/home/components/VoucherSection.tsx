'use client';

import { SimpleGrid, Paper, Flex, Stack, Text, ThemeIcon, Button, useComputedColorScheme } from '@mantine/core';
import { IconTicket } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface Voucher {
    code: string;
    discount: string;
    min: string;
    expire: string;
    color: string;
}

const VOUCHERS: Voucher[] = [
    { code: 'WELCOMENEW', discount: '50K', min: 'Đơn từ 200K', expire: '30/12', color: 'teal' },
    { code: 'FREESHIP', discount: 'Mien phi van chuyen', min: 'Mọi đơn hàng', expire: 'Hôm nay', color: 'orange' },
    { code: 'TECHLOVER', discount: '10%', min: 'Đồ công nghệ', expire: 'Còn 2 ngày', color: 'blue' },
];

export function VoucherSection() {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    return (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
            {VOUCHERS.map((v, i) => (
                <Paper key={i} p="md" radius="md" withBorder
                    bg={isDark ? `${v.color}.9` : `${v.color}.0`}
                    style={{ borderColor: isDark ? `var(--mantine-color-${v.color}-8)` : `var(--mantine-color-${v.color}-3)` }}
                    component={motion.div}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Flex gap="md" align="center">
                        <ThemeIcon size={48} radius="xl" color={v.color} variant="filled">
                            <IconTicket size={24} />
                        </ThemeIcon>
                        <Stack gap={2} style={{ flex: 1 }}>
                            <Text fw={700} c={isDark ? 'white' : `${v.color}.9`}>GIẢM {v.discount}</Text>
                            <Text size="xs" c={isDark ? 'dimmed' : 'dimmed'}>{v.min}</Text>
                            <Text size="xs" c={isDark ? `${v.color}.2` : `${v.color}.7`} fw={600}>HSD: {v.expire}</Text>
                        </Stack>
                        <Button size="xs" radius="xl" variant="white" c={v.color}>Lưu</Button>
                    </Flex>
                </Paper>
            ))}
        </SimpleGrid>
    )
}
