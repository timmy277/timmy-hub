'use client';

import {
    Container, Title, Text, Stack, Card, Group, Badge, Button,
    Grid, Image, ActionIcon, Box, ThemeIcon, Progress,
    Flex, Paper, SimpleGrid, Tabs,
    Overlay,
    Center,
    useMantineTheme,
    useComputedColorScheme
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { MainShell } from '@/components/layout';
import {
    IconShoppingCart, IconHeart, IconStar,
    IconFlame, IconClock, IconTruck,
    IconShieldCheck, IconPhoneCall,
    IconLayoutGrid, IconList, IconArrowRight,
    IconTicket
} from '@tabler/icons-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@mantine/carousel/styles.css';

// --- ANIMATION VARIANTS ---
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

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 }
};

// --- MOCK DATA ---
const HERO_SLIDES = [
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

const CATEGORIES = [
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

const FLASH_SALE_PRODUCTS = [
    {
        id: 1,
        name: 'Tai nghe Sony WH-1000XM5 Chống Ồn',
        image: 'https://picsum.photos/id/1/600/600',
        price: 6490000,
        originalPrice: 8990000,
        sold: 85,
        total: 100,
        rating: 4.8
    },
    {
        id: 2,
        name: 'Apple Watch Series 9 GPS 41mm',
        image: 'https://picsum.photos/id/119/600/600',
        price: 9290000,
        originalPrice: 10500000,
        sold: 45,
        total: 150,
        rating: 4.9
    },
    {
        id: 3,
        name: 'Giày Nike Air Jordan 1 Low',
        image: 'https://picsum.photos/id/21/600/600',
        price: 3250000,
        originalPrice: 4500000,
        sold: 92,
        total: 100,
        rating: 4.7
    },
    {
        id: 4,
        name: 'Loa Marshall Stanmore III',
        image: 'https://picsum.photos/id/129/600/600',
        price: 7890000,
        originalPrice: 9500000,
        sold: 12,
        total: 50,
        rating: 5.0
    },
    {
        id: 5,
        name: 'Kính thực tế ảo Meta Quest 3',
        image: 'https://picsum.photos/id/36/600/600',
        price: 14500000,
        originalPrice: 16900000,
        sold: 22,
        total: 40,
        rating: 4.6
    }
];

const PRODUCTS = [
    {
        id: 101,
        name: 'MacBook Air M2 2024 13 inch',
        category: 'Laptop',
        image: 'https://picsum.photos/id/0/600/600',
        price: 24990000,
        rating: 4.9,
        reviews: 128,
        isNew: true
    },
    {
        id: 102,
        name: 'Bàn phím cơ Keychron K2 Pro',
        category: 'Phụ kiện',
        image: 'https://picsum.photos/id/48/600/600',
        price: 2190000,
        rating: 4.7,
        reviews: 342,
        discount: '10%'
    },
    {
        id: 103,
        name: 'Ghế Công Thái Học Herman Miller',
        category: 'Nội thất',
        image: 'https://picsum.photos/id/96/600/600',
        price: 35000000,
        rating: 5.0,
        reviews: 56
    },
    {
        id: 104,
        name: 'Nước hoa Chanel Bleu de Chanel',
        category: 'Làm đẹp',
        image: 'https://picsum.photos/id/152/600/600',
        price: 3850000,
        rating: 4.8,
        reviews: 89,
        isNew: true
    },
    {
        id: 105,
        name: 'Túi xách da thật cao cấp',
        category: 'Thời trang',
        image: 'https://picsum.photos/id/157/600/600',
        price: 1550000,
        rating: 4.5,
        reviews: 210,
        discount: '25%'
    },
    {
        id: 106,
        name: 'Máy ảnh Fujifilm X-T5 Body',
        category: 'Camera',
        image: 'https://picsum.photos/id/250/600/600',
        price: 41500000,
        rating: 4.9,
        reviews: 45
    },
    {
        id: 107,
        name: 'Đèn bàn học chống cận',
        category: 'Gia dụng',
        image: 'https://picsum.photos/id/366/600/600',
        price: 450000,
        rating: 4.4,
        reviews: 1100,
        discount: '50%'
    },
    {
        id: 108,
        name: 'Balo chống nước du lịch',
        category: 'Phụ kiện',
        image: 'https://picsum.photos/id/525/600/600',
        price: 890000,
        rating: 4.6,
        reviews: 78
    }
];

const VOUCHERS = [
    { code: 'WELCOMENEW', discount: '50K', min: 'Đơn từ 200K', expire: '30/12', color: 'teal' },
    { code: 'FREESHIP', discount: 'Mien phi van chuyen', min: 'Mọi đơn hàng', expire: 'Hôm nay', color: 'orange' },
    { code: 'TECHLOVER', discount: '10%', min: 'Đồ công nghệ', expire: 'Còn 2 ngày', color: 'blue' },
];

// --- COMPONENTS ---

function HeroCarousel() {
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

function CategorySection() {
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

function FlashSaleBanner() {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    return (
        <motion.div variants={scaleIn} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8 }}>
            <Paper p="xl" radius="lg" bg={isDark ? 'red.9' : 'red.0'} style={{ border: '2px solid var(--mantine-color-red-filled)' }} my="xl">
                <Group justify="space-between" mb="lg" align="flex-end">
                    <Group gap="xs">
                        <IconFlame size={32} color="red" fill="orange" />
                        <Title order={2} c="red.8" tt="uppercase" style={{ letterSpacing: 1 }}>Flash Sale</Title>
                        <Badge size="lg" color="red" variant="filled" ml="md">Kết thúc sau</Badge>
                        <Group gap={4}>
                            <Badge size="lg" color="dark" radius="sm">02</Badge> :
                            <Badge size="lg" color="dark" radius="sm">15</Badge> :
                            <Badge size="lg" color="dark" radius="sm">40</Badge>
                        </Group>
                    </Group>
                    <Button variant="white" color="red" radius="xl">Xem tất cả &gt;</Button>
                </Group>

                <Carousel slideSize={{ base: '80%', xs: '50%', sm: '33%', md: '20%' }} slideGap="md">
                    {FLASH_SALE_PRODUCTS.map((product) => (
                        <Carousel.Slide key={product.id}>
                            <Card shadow="sm" padding="xs" radius="md" withBorder>
                                <Card.Section>
                                    <Box pos="relative">
                                        <Image src={product.image} height={180} alt={product.name} />
                                        <Badge color="red" variant="filled" pos="absolute" top={10} left={10}>-{Math.round((1 - product.price / product.originalPrice) * 100)}%</Badge>
                                    </Box>
                                </Card.Section>
                                <Stack gap={4} mt="sm">
                                    <Text size="sm" lineClamp={2} fw={600} h={42}>{product.name}</Text>
                                    <Text size="lg" fw={800} c="red">{product.price.toLocaleString()}đ</Text>
                                    <Text size="xs" td="line-through" c="dimmed">{product.originalPrice.toLocaleString()}đ</Text>
                                    <Stack gap={2} mt={5}>
                                        <Group justify="space-between">
                                            <Text size="xs" c="red" fw={700}>Đã bán {product.sold}</Text>
                                            <IconFlame size={14} color="orange" />
                                        </Group>
                                        <Progress value={(product.sold / product.total) * 100} color="red" size="md" radius="xl" animated striped />
                                    </Stack>
                                </Stack>
                            </Card>
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Paper>
        </motion.div>
    )
}

function ProductGrid({ viewMode, activeTab }: { viewMode: 'grid' | 'list', activeTab: string }) {
    const displayProducts = PRODUCTS.filter(p => {
        if (activeTab === 'new') return p.isNew;
        if (activeTab === 'sale') return p.discount;
        if (activeTab === 'best') return p.rating >= 4.8;
        return true;
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`${viewMode}-${activeTab}`}
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
                <Grid gutter="lg">
                    {displayProducts.length > 0 ? (
                        displayProducts.map((product) => (
                        <Grid.Col key={product.id} span={viewMode === 'list' ? 12 : { base: 12, xs: 6, sm: 4, md: 3 }}>
                            <motion.div
                                variants={scaleIn}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                                    {viewMode === 'grid' ? (
                                        <>
                                            <Card.Section>
                                                <Box pos="relative">
                                                    <Image src={product.image} height={200} alt={product.name} />
                                                    {product.isNew && <Badge color="green" pos="absolute" top={10} right={10}>Mới</Badge>}
                                                    {product.discount && <Badge color="red" pos="absolute" top={10} left={10}>-{product.discount}</Badge>}
                                                    <ActionIcon variant="light" color="red" radius="xl" size="lg" pos="absolute" bottom={10} right={10}>
                                                        <IconHeart size={18} />
                                                    </ActionIcon>
                                                </Box>
                                            </Card.Section>
                                            <Stack mt="md" gap="xs">
                                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{product.category}</Text>
                                                <Text fw={600} size="md" lineClamp={2} h={48} title={product.name}>{product.name}</Text>

                                                <Group gap={4}>
                                                    <IconStar size={14} fill="orange" color="orange" />
                                                    <Text size="xs">{product.rating}</Text>
                                                    <Text size="xs" c="dimmed">({product.reviews} đánh giá)</Text>
                                                </Group>

                                                <Group justify="space-between" align="center" mt="xs">
                                                    <Text size="xl" fw={800} c="blue">{product.price.toLocaleString()}đ</Text>
                                                    <ActionIcon variant="filled" color="blue" size="lg" radius="md">
                                                        <IconShoppingCart size={18} />
                                                    </ActionIcon>
                                                </Group>
                                            </Stack>
                                        </>
                                    ) : (
                                        <Grid>
                                            <Grid.Col span={3}>
                                                <Image src={product.image} radius="md" height="100%" fit="cover" alt={product.name} />
                                            </Grid.Col>
                                            <Grid.Col span={9}>
                                                <Flex direction="column" h="100%" justify="space-between">
                                                    <Stack gap="xs">
                                                        <Group justify="space-between">
                                                            <Badge color="gray">{product.category}</Badge>
                                                            {product.isNew && <Badge color="green">Hàng Mới</Badge>}
                                                        </Group>
                                                        <Title order={4}>{product.name}</Title>
                                                        <Group gap={4}>
                                                            <IconStar size={16} fill="orange" color="orange" />
                                                            <Text size="sm">{product.rating} ({product.reviews} đánh giá)</Text>
                                                        </Group>
                                                        <Text lineClamp={2} c="dimmed" size="sm">Mô tả ngắn về sản phẩm này sẽ nằm ở đây. Giúp người dùng hiểu rõ hơn về tính năng nổi bật.</Text>
                                                    </Stack>
                                                    <Group justify="space-between" mt="md">
                                                        <Stack gap={0}>
                                                            <Text size="xl" fw={800} c="blue">{product.price.toLocaleString()}đ</Text>
                                                            {product.discount && <Text size="sm" td="line-through" c="dimmed">Giá gốc: 25,000,000đ</Text>}
                                                        </Stack>
                                                        <Group>
                                                            <Button variant="light" color="gray" leftSection={<IconHeart size={16} />}>Yêu thích</Button>
                                                            <Button variant="filled" color="blue" leftSection={<IconShoppingCart size={16} />}>Thêm vào giỏ</Button>
                                                        </Group>
                                                    </Group>
                                                </Flex>
                                            </Grid.Col>
                                        </Grid>
                                    )}
                                </Card>
                            </motion.div>
                        </Grid.Col>
                        ))
                    ) : (
                        <Grid.Col span={12}>
                            <Center p="xl" h={200}>
                                <Text c="dimmed">Không có sản phẩm nào cho bộ lọc này.</Text>
                            </Center>
                        </Grid.Col>
                    )}
                </Grid>
            </motion.div>
        </AnimatePresence>
    )
}

function VoucherSection() {
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

function FeatureSection() {
    const features = [
        { icon: IconTruck, title: 'Miễn Phí Vận Chuyển', desc: 'Cho đơn từ 199k' },
        { icon: IconShieldCheck, title: 'Bảo Hành Chính Hãng', desc: 'Cam kết 100%' },
        { icon: IconPhoneCall, title: 'Hỗ Trợ 24/7', desc: 'Hotline: 1900 1234' },
        { icon: IconClock, title: 'Giao Hàng Nhanh', desc: 'Nội thành 2h' },
    ];
    return (
        <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.5 }}
        >
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg" my="xl">
                {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                        >
                        <Group gap="sm">
                            <ThemeIcon size={42} radius="md" variant="light" color="blue">
                                <Icon size={24} />
                            </ThemeIcon>
                            <Stack gap={0}>
                                <Text fw={600} size="sm">{f.title}</Text>
                                <Text size="xs" c="dimmed">{f.desc}</Text>
                            </Stack>
                        </Group>
                    </motion.div>
                );
            })}
            </SimpleGrid>
        </motion.div>
    )
}

export function HomePage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    return (
        <MainShell>
            <Container size="xl" py="lg">
                <Stack gap="xl">
                    {/* Hero Section */}
                    <HeroCarousel />

                    {/* Features */}
                    <FeatureSection />

                    {/* Vouchers */}
                    <VoucherSection />

                    {/* Categories */}
                    <CategorySection />

                    {/* Flash Sale */}
                    <FlashSaleBanner />

                    {/* Main Products */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <Stack gap="md" id="products-section">
                            <motion.div variants={fadeInUp}>
                                <Group justify="space-between" align="center">
                                    <Box>
                                        <Title order={2} mb={4}>Gợi Ý Hôm Nay</Title>
                                        <Text c="dimmed">Những sản phẩm tốt nhất dành riêng cho bạn</Text>
                                    </Box>

                                    <Group>
                                        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="xl">
                                            <Tabs.List>
                                                <Tabs.Tab value="all">Tất cả</Tabs.Tab>
                                                <Tabs.Tab value="new">Mới nhất</Tabs.Tab>
                                                <Tabs.Tab value="best">Bán chạy</Tabs.Tab>
                                                <Tabs.Tab value="sale">Giảm giá</Tabs.Tab>
                                            </Tabs.List>
                                        </Tabs>
                                        <Group gap={0} style={{ border: isDark ? '1px solid var(--mantine-color-dark-4)' : '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                                            <ActionIcon
                                                variant={viewMode === 'grid' ? 'filled' : 'subtle'}
                                                color="blue"
                                                size="lg"
                                                onClick={() => setViewMode('grid')}
                                                radius={0}
                                            >
                                                <IconLayoutGrid size={20} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant={viewMode === 'list' ? 'filled' : 'subtle'}
                                                color="blue"
                                                size="lg"
                                                onClick={() => setViewMode('list')}
                                                radius={0}
                                            >
                                                <IconList size={20} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Group>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <ProductGrid viewMode={viewMode} activeTab={activeTab || 'all'} />
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Center mt="xl">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" size="md" radius="xl" px={40}>Xem Thêm Sản Phẩm</Button>
                                    </motion.div>
                                </Center>
                            </motion.div>
                        </Stack>
                    </motion.div>

                    {/* Footer Promo */}
                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1 }}>
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
                    </motion.div>

                </Stack>
            </Container>
        </MainShell>
    );
}
