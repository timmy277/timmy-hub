'use client';

import { Carousel } from '@mantine/carousel';
import { Container, Title, Text, Badge, Button, Box, Flex, Stack, Overlay } from '@mantine/core';
import { Image } from '@mantine/core';
import { motion } from 'framer-motion';
import '@mantine/carousel/styles.css';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

interface HeroSlide {
    image: string;
    title: string;
    desc: string;
    action: string;
    color: string;
}

const HERO_SLIDES: HeroSlide[] = [
    {
        image: 'https://picsum.photos/id/20/1920/1080',
        title: 'Siêu Sale Đón Hè - Giảm Sốc 50%',
        desc: 'Thời trang, phụ kiện công nghệ và nhiều hơn nữa. Săn ngay deal hot đừng bỏ lỡ!',
        action: 'Mua Ngay',
        color: 'blue'
    },
    {
        image: 'https://picsum.photos/id/119/1920/1080',
        title: 'Tech Fest 2026 - Công Nghệ Đỉnh Cao',
        desc: 'Nâng cấp thiết bị của bạn với những sản phẩm mới nhất từ Apple, Samsung, Sony.',
        action: 'Khám Phá',
        color: 'grape'
    },
    {
        image: 'https://picsum.photos/id/180/1920/1080',
        title: 'Phong Cách Sống Mới',
        desc: 'Trang trí nhà cửa, nội thất hiện đại với mức giá ưu đãi nhất năm.',
        action: 'Xem Chi Tiết',
        color: 'teal'
    }
];

export function HeroCarousel() {
    return (
        <motion.div variants={fadeInUp} initial="initial" animate="animate" viewport={{ amount: 0.3 }}>
            <Carousel withIndicators height={440} slideSize="100%"
                plugins={[]}
                style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            >
                {HERO_SLIDES.map((slide, index) => (
                    <Carousel.Slide key={index}>
                        <Box h="100%" pos="relative">
                            <Image src={slide.image} h="100%" w="100%" fit="cover" alt={slide.title} />
                            <Overlay gradient="linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%)" opacity={1} zIndex={1} />
                            <Container size="xl" h="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
                                <Flex h="100%" align="center">
                                    <Stack maw={500} p="xl">
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                            <Badge size="lg" variant="gradient" gradient={{ from: slide.color, to: 'pink' }}>HOT DEAL</Badge>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                                            <Title c="white" order={1} size={48} style={{ lineHeight: 1.1 }}>{slide.title}</Title>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                                            <Text c="gray.3" size="lg">{slide.desc}</Text>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                            <Button size="lg" radius="xl" variant="gradient" gradient={{ from: slide.color, to: 'cyan' }} mt="md">
                                                {slide.action}
                                            </Button>
                                        </motion.div>
                                    </Stack>
                                </Flex>
                            </Container>
                        </Box>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </motion.div>
    );
}
