'use client';

import { Carousel } from '@mantine/carousel';
import { Title, Text, Button, Box, Stack, Overlay } from '@mantine/core';
import { Image } from '@mantine/core';
import Link from 'next/link';
import '@mantine/carousel/styles.css';

interface HeroSlide {
    image: string;
    tag: string;
    title: string;
    desc: string;
    action: string;
    href: string;
}

const HERO_SLIDES: HeroSlide[] = [
    {
        image: 'https://picsum.photos/id/20/1920/1080',
        tag: 'Ưu đãi hôm nay',
        title: 'Siêu Sale Đón Hè\nGiảm đến 50%',
        desc: 'Thời trang, phụ kiện công nghệ và nhiều hơn nữa.',
        action: 'Mua ngay',
        href: '/collection',
    },
    {
        image: 'https://picsum.photos/id/119/1920/1080',
        tag: 'Công nghệ mới',
        title: 'Tech Fest 2026\nCông Nghệ Đỉnh Cao',
        desc: 'Nâng cấp thiết bị với những sản phẩm mới nhất.',
        action: 'Khám phá',
        href: '/collection',
    },
    {
        image: 'https://picsum.photos/id/180/1920/1080',
        tag: 'Phong cách sống',
        title: 'Nội Thất Hiện Đại\nGiá Ưu Đãi Nhất Năm',
        desc: 'Trang trí nhà cửa với mức giá tốt nhất.',
        action: 'Xem chi tiết',
        href: '/collection',
    },
];

export function HeroCarousel() {
    return (
        <Carousel
            withIndicators
            height={480}
            slideSize="100%"
            emblaOptions={{ loop: true }}
            style={{ borderRadius: 16, overflow: 'hidden' }}
        >
            {HERO_SLIDES.map((slide) => (
                <Carousel.Slide key={slide.title}>
                    <Box h="100%" pos="relative">
                        <Image src={slide.image} h="100%" w="100%" fit="cover" alt={slide.title} />
                        <Overlay
                            gradient="linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)"
                            opacity={1}
                            zIndex={1}
                        />
                        <Box
                            pos="absolute"
                            top={0} left={0} right={0} bottom={0}
                            style={{ zIndex: 2, display: 'flex', alignItems: 'center', padding: '0 64px' }}
                        >
                            <Stack gap={20} maw={520}>
                                <Text
                                    size="sm"
                                    fw={600}
                                    c="white"
                                    style={{
                                        opacity: 0.72,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        fontSize: 12,
                                    }}
                                >
                                    {slide.tag}
                                </Text>
                                <Title
                                    c="white"
                                    order={1}
                                    style={{
                                        fontSize: 40,
                                        fontWeight: 800,
                                        lineHeight: 1.15,
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {slide.title}
                                </Title>
                                <Text c="white" size="md" style={{ opacity: 0.8, maxWidth: 400 }}>
                                    {slide.desc}
                                </Text>
                                <Box>
                                    <Button
                                        component={Link}
                                        href={slide.href}
                                        size="md"
                                        radius={50}
                                        style={{
                                            background: '#00a76f',
                                            color: '#fff',
                                            fontWeight: 700,
                                            paddingLeft: 28,
                                            paddingRight: 28,
                                        }}
                                    >
                                        {slide.action}
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </Carousel.Slide>
            ))}
        </Carousel>
    );
}
