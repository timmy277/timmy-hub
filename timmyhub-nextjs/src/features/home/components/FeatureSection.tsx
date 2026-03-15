'use client';

import { SimpleGrid, Group, Text, ThemeIcon, Stack, Paper } from '@mantine/core';
import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { useComputedColorScheme } from '@mantine/core';

interface Feature {
    icon: string;
    title: string;
    desc: string;
}

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export function FeatureSection() {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    const features: Feature[] = [
        { icon: 'tabler:truck', title: 'Miễn Phí Vận Chuyển', desc: 'Cho đơn từ 199k' },
        { icon: 'tabler:shield-check', title: 'Bảo Hành Chính Hãng', desc: 'Cam kết 100%' },
        { icon: 'tabler:phone-call', title: 'Hỗ Trợ 24/7', desc: 'Hotline: 1900 1234' },
        { icon: 'tabler:clock', title: 'Giao Hàng Nhanh', desc: 'Nội thành 2h' },
    ];

    return (
        <m.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.5 }}
        >
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg" my="xl">
                {features.map((f) => {
                    return (
                        <m.div
                            key={f.title}
                            variants={fadeInUp}
                        >
                            <Paper
                                p="md"
                                radius="md"
                                withBorder
                                style={{
                                    backgroundColor: isDark
                                        ? 'var(--mantine-color-dark-7)'
                                        : 'var(--mantine-color-white)',
                                }}
                            >
                                <Group gap="sm">
                                    <ThemeIcon size={42} radius="md" variant="light" color="blue">
                                        <Icon icon={f.icon} width={24} />
                                    </ThemeIcon>
                                    <Stack gap={0}>
                                        <Text fw={600} size="sm">{f.title}</Text>
                                        <Text size="xs" c="dimmed">{f.desc}</Text>
                                    </Stack>
                                </Group>
                            </Paper>
                        </m.div>
                    );
                })}
            </SimpleGrid>
        </m.div>
    )
}
