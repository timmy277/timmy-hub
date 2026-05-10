'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Group, Title, Text, Anchor } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import '@mantine/carousel/styles.css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
    { icon: 'solar:laptop-bold', name: 'Laptop & PC', slug: 'laptop-pc', color: '#0c68e9' },
    { icon: 'solar:phone-bold', name: 'Điện thoại', slug: 'dien-thoai', color: '#00a76f' },
    { icon: 'solar:headphones-round-sound-bold', name: 'Âm thanh', slug: 'am-thanh', color: '#ff3030' },
    { icon: 'solar:watch-square-bold', name: 'Đồng hồ', slug: 'dong-ho', color: '#ff6b00' },
    { icon: 'solar:camera-bold', name: 'Camera', slug: 'camera', color: '#7635dc' },
    { icon: 'solar:gameboy-bold', name: 'Gaming', slug: 'gaming', color: '#6366f1' },
    { icon: 'solar:home-bold', name: 'Nhà cửa', slug: 'nha-cua', color: '#00b8d9' },
    { icon: 'solar:cosmetic-bold', name: 'Làm đẹp', slug: 'lam-dep', color: '#ff3366' },
    { icon: 'solar:book-bold', name: 'Sách', slug: 'sach', color: '#ffab00' },
    { icon: 'solar:football-bold', name: 'Thể thao', slug: 'the-thao', color: '#00a76f' },
];

function CategorySectionComponent() {
    const { t } = useTranslation('common');
    return (
        <Box component="section" aria-labelledby="category-section-title" suppressHydrationWarning>
            <Group justify="space-between" mb={24}>
                <Title
                    id="category-section-title"
                    order={2}
                    style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#1c252e',
                        letterSpacing: '-0.5px',
                    }}
                >
                    {t('categorySection.title')}
                </Title>
                <Anchor
                    component={Link}
                    href="/collection"
                    size="md"
                    fw={400}
                    style={{
                        color: '#00a76f',
                        fontFamily: 'Public Sans Variable, sans-serif',
                        fontSize: 16,
                        textDecoration: 'none',
                    }}
                    styles={{
                        root: {
                            '&:hover': {
                                textDecoration: 'underline',
                                color: '#007C56',
                            }
                        }
                    }}
                    aria-label={t('categorySection.viewAllAria')}
                >
                    {t('categorySection.viewAll')}
                </Anchor>
            </Group>

            <Carousel
                slideSize={{ base: '25%', sm: '16.66%', md: '12%' }}
                slideGap="md"
                withControls
                emblaOptions={{ align: 'start' }}
                aria-label={t('categorySection.carouselAria')}
            >
                {CATEGORIES.map((cat) => (
                    <Carousel.Slide key={cat.slug}>
                        <Link href={`/collection?category=${cat.slug}`} style={{ textDecoration: 'none' }} aria-label={`Xem sản phẩm ${cat.name}`}>
                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 16,
                                    borderRadius: 12,
                                    border: '1px solid #DFE3E8',
                                    background: '#FFFFFF',
                                    cursor: 'pointer',
                                    transition: 'all 150ms ease',
                                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                                }}
                                styles={{
                                    root: {
                                        '&:hover': {
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
                                            borderColor: '#C4CDD5',
                                        }
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <Box
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 12,
                                        background: `${cat.color}18`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    aria-hidden="true"
                                >
                                    <Iconify icon={cat.icon} width={28} color={cat.color} />
                                </Box>
                                <Text
                                    size="sm"
                                    fw={600}
                                    ta="center"
                                    style={{
                                        color: '#1c252e',
                                        lineHeight: 1.4,
                                        fontFamily: 'Public Sans Variable, sans-serif',
                                        fontSize: 14,
                                    }}
                                >
                                    {cat.name}
                                </Text>
                            </Box>
                        </Link>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Box>
    );
}

export const CategorySection = memo(CategorySectionComponent);
