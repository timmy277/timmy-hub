'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Group, Title, Button, Paper, Text, ThemeIcon, useMantineTheme } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

interface Category {
    icon: string;
    name: string;
    color: string;
}

const CATEGORIES: Category[] = [
    { icon: '💻', name: 'Laptop & PC', color: 'blue' },
    { icon: '📱', name: 'Điện thoại', color: 'green' },
    { icon: '🎧', name: 'Âm thanh', color: 'red' },
    { icon: '⌚', name: 'Đồng hồ', color: 'orange' },
    { icon: '📷', name: 'Camera', color: 'grape' },
    { icon: '🎮', name: 'Gaming', color: 'violet' },
    { icon: '🏠', name: 'Nhà cửa', color: 'cyan' },
    { icon: '💄', name: 'Làm đẹp', color: 'pink' },
    { icon: '📚', name: 'Sách', color: 'yellow' },
    { icon: '⚽', name: 'Thể thao', color: 'teal' },
];

export function CategorySection() {
    const theme = useMantineTheme();
    return (
        <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }}>
            <Box py="xl">
                <Group justify="space-between" mb="lg">
                    <Title order={3}>Danh Mục Nổi Bật</Title>
                    <Button variant="subtle" rightSection={<IconArrowRight size={16} />}>Xem tất cả</Button>
                </Group>
                <Carousel slideSize={{ base: '33%', sm: '20%', md: '14%' }} slideGap="md" withControls>
                    {CATEGORIES.map((cat, idx) => (
                        <Carousel.Slide key={idx}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Paper
                                    p="md" radius="md" withBorder
                                    style={{
                                        cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s',
                                        '&:hover': { borderColor: theme.colors.blue[6] }
                                    }}
                                    bg="var(--mantine-color-body)"
                                >
                                    <ThemeIcon size={60} radius="xl" variant="light" color={cat.color} mb="xs" fz={30}>
                                        {cat.icon}
                                    </ThemeIcon>
                                    <Text size="sm" fw={600} truncate>{cat.name}</Text>
                                </Paper>
                            </motion.div>
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Box>
        </motion.div>
    )
}
