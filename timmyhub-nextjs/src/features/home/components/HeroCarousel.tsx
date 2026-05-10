'use client';

import { Carousel } from '@mantine/carousel';
import { Title, Text, Button, Box, Stack, Overlay } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import '@mantine/carousel/styles.css';
import { memo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

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

function HeroCarouselComponent() {
    const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

    return (
        <Box suppressHydrationWarning>
            <Carousel
                withIndicators
                height={520}
                draggable
                withControls
                plugins={[autoplay.current]}
                onMouseEnter={autoplay.current.stop}
                onMouseLeave={autoplay.current.reset}
                style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)' }}
                aria-label="Banner khuyến mãi"
                aria-roledescription="carousel"
            >
                {HERO_SLIDES.map((slide, index) => (
                    <Carousel.Slide key={slide.title} aria-label={`Slide ${index + 1} của ${HERO_SLIDES.length}: ${slide.title}`}>
                        <Box h="100%" pos="relative" role="group" aria-roledescription="slide">
                            <Image
                                src={slide.image}
                                alt={`${slide.title} - ${slide.desc}`}
                                fill
                                priority={index === 0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                style={{ objectFit: 'cover' }}
                            />
                            <Overlay
                                gradient="linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)"
                                opacity={1}
                                zIndex={1}
                            />
                            <Box
                                pos="absolute"
                                top={0} left={0} right={0} bottom={0}
                                style={{ zIndex: 2, display: 'flex', alignItems: 'center', padding: '0 80px' }}
                            >
                                <Stack gap={24} maw={560}>
                                    <Text
                                        size="sm"
                                        fw={600}
                                        c="white"
                                        style={{
                                            opacity: 0.72,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            fontSize: 12,
                                            fontFamily: 'Public Sans Variable, sans-serif',
                                        }}
                                        component="span"
                                        aria-label={`Danh mục: ${slide.tag}`}
                                    >
                                        {slide.tag}
                                    </Text>
                                    <Title
                                        c="white"
                                        order={1}
                                        style={{
                                            fontFamily: 'Barlow, sans-serif',
                                            fontSize: 48,
                                            fontWeight: 800,
                                            lineHeight: 1.2,
                                            whiteSpace: 'pre-line',
                                            letterSpacing: '-1px',
                                        }}
                                    >
                                        {slide.title}
                                    </Title>
                                    <Text
                                        c="white"
                                        size="lg"
                                        style={{
                                            opacity: 0.88,
                                            maxWidth: 480,
                                            fontFamily: 'Public Sans Variable, sans-serif',
                                            fontSize: 20,
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        {slide.desc}
                                    </Text>
                                    <Box mt={8}>
                                        <Button
                                            component={Link}
                                            href={slide.href}
                                            size="lg"
                                            radius={8}
                                            style={{
                                                background: '#00a76f',
                                                color: '#fff',
                                                fontWeight: 400,
                                                fontFamily: 'Public Sans Variable, sans-serif',
                                                fontSize: 16,
                                                paddingLeft: 24,
                                                paddingRight: 24,
                                                height: 48,
                                                boxShadow: 'rgba(0, 167, 111, 0.24) 0px 8px 16px 0px',
                                                transition: 'all 150ms ease',
                                            }}
                                            styles={{
                                                root: {
                                                    '&:hover': {
                                                        background: '#00936A',
                                                        boxShadow: 'rgba(0, 167, 111, 0.32) 0px 12px 20px 0px',
                                                    }
                                                }
                                            }}
                                            aria-label={`${slide.action} - ${slide.title}`}
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
        </Box>
    );
}

export const HeroCarousel = memo(HeroCarouselComponent);
