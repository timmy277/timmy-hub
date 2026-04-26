'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Group, Title, Text, Anchor } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import Link from 'next/link';
import '@mantine/carousel/styles.css';
import { memo } from 'react';

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
    return (
        <Box component="section" aria-labelledby="category-section-title">
            <Group justify="space-between" mb={20}>
                <Title id="category-section-title" order={3} style={{ fontSize: 20, fontWeight: 700, color: '#1c252e' }}>
                    Danh mục nổi bật
                </Title>
                <Anchor component={Link} href="/collection" size="sm" fw={600} style={{ color: '#00a76f' }} aria-label="Xem tất cả danh mục">
                    Xem tất cả
                </Anchor>
            </Group>

            <Carousel
                slideSize={{ base: '25%', sm: '16.66%', md: '12%' }}
                slideGap="sm"
                withControls
                emblaOptions={{ align: 'start' }}
                aria-label="Danh mục sản phẩm"
            >
                {CATEGORIES.map((cat) => (
                    <Carousel.Slide key={cat.slug}>
                        <Link href={`/collection?category=${cat.slug}`} style={{ textDecoration: 'none' }} aria-label={`Xem sản phẩm ${cat.name}`}>
                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 8px',
                                    borderRadius: 12,
                                    border: '1px solid var(--mantine-color-default-border)',
                                    background: 'var(--mantine-color-body)',
                                    cursor: 'pointer',
                                    transition: 'border-color 150ms',
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <Box
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: `${cat.color}18`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    aria-hidden="true"
                                >
                                    <Iconify icon={cat.icon} width={26} color={cat.color} />
                                </Box>
                                <Text size="xs" fw={500} ta="center" style={{ color: '#1c252e', lineHeight: 1.3 }}>
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
