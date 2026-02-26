'use client';

import { Container, Text, Group, ActionIcon, Box, Grid, Title, Stack, TextInput, ThemeIcon, useComputedColorScheme } from '@mantine/core';
import { 
    IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconBrandFacebook,
    IconMapPin, IconPhone, IconMail, IconSend
} from '@tabler/icons-react';
import Link from 'next/link';

const FOOTER_LINKS = [
    {
        title: 'Về TimmyHub',
        links: [
            { label: 'Giới thiệu', link: '#' },
            { label: 'Tuyển dụng', link: '#' },
            { label: 'Chính sách bảo mật', link: '#' },
            { label: 'Điều khoản dịch vụ', link: '#' },
            { label: 'Blog', link: '#' },
        ]
    },
    {
        title: 'Hỗ Trợ Khách Hàng',
        links: [
            { label: 'Trung tâm trợ giúp', link: '#' },
            { label: 'Hướng dẫn mua hàng', link: '#' },
            { label: 'Chính sách đổi trả', link: '#' },
            { label: 'Phương thức thanh toán', link: '#' },
            { label: 'Vận chuyển', link: '#' },
        ]
    },
    {
        title: 'Hợp Tác',
        links: [
            { label: 'Bán hàng cùng TimmyHub', link: '#' },
            { label: 'Affiliate Program', link: '#' },
            { label: 'Nhà cung cấp', link: '#' },
        ]
    }
];

export function Footer() {
    const computedColorScheme = useComputedColorScheme('light');
    const isDark = computedColorScheme === 'dark';

    return (
        <Box 
            component="footer" 
            bg={isDark ? 'dark.8' : 'gray.0'} 
            pt={80} 
            pb={40} 
            style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
        >
            <Container size="xl">
                <Grid gutter={40}>
                    {/* Brand Column */}
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Stack gap="lg">
                            <Stack gap={4}>
                                <Text fw={900} size="32px" style={{ letterSpacing: -1, lineHeight: 1 }}>
                                    TIMMY<Text span c="blue" inherit>HUB</Text>
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Nền tảng thương mại điện tử hàng đầu, mang đến trải nghiệm mua sắm tuyệt vời và tiện lợi nhất.
                                </Text>
                            </Stack>

                            <Stack gap="xs">
                                <Group gap="xs">
                                    <ThemeIcon variant="light" color="blue" size="md">
                                        <IconMapPin size={16} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">Tầng 12, Tòa nhà Landmark 81, TP.HCM</Text>
                                </Group>
                                <Group gap="xs">
                                    <ThemeIcon variant="light" color="blue" size="md">
                                        <IconPhone size={16} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">1900 1234 (8:00 - 22:00)</Text>
                                </Group>
                                <Group gap="xs">
                                    <ThemeIcon variant="light" color="blue" size="md">
                                        <IconMail size={16} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">support@timmyhub.com</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Links Columns */}
                    {FOOTER_LINKS.map((group) => (
                        <Grid.Col key={group.title} span={{ base: 6, sm: 4, md: 2, lg: 2 }}>
                            <Title order={5} mb="md">{group.title}</Title>
                            <Stack gap="xs">
                                {group.links.map((link) => (
                                    <Link key={link.label} href={link.link} style={{ textDecoration: 'none' }}>
                                        <Text size="sm" c="dimmed" style={{ transition: 'color 0.2s' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--mantine-color-blue-6)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mantine-color-dimmed)')}
                                        >
                                            {link.label}
                                        </Text>
                                    </Link>
                                ))}
                            </Stack>
                        </Grid.Col>
                    ))}

                    {/* Newsletter Column */}
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Title order={5} mb="md">Đăng Ký Nhận Tin</Title>
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">
                                Nhận thông tin về các chương trình khuyến mãi và mã giảm giá sớm nhất.
                            </Text>
                            <Group gap={0}>
                                <TextInput
                                    placeholder="Email của bạn"
                                    radius="xl"
                                    size="md"
                                    w="100%"
                                    rightSection={
                                        <ActionIcon size={32} radius="xl" color="blue" variant="filled">
                                            <IconSend size={18} stroke={1.5} />
                                        </ActionIcon>
                                    }
                                    style={{ flex: 1 }}
                                />
                            </Group>
                            
                            <Title order={6} mt="md">Kết nối với chúng tôi</Title>
                            <Group gap="sm">
                                <ActionIcon size="lg" color="blue" variant="light" radius="xl">
                                    <IconBrandFacebook size={20} stroke={1.5} />
                                </ActionIcon>
                                <ActionIcon size="lg" color="cyan" variant="light" radius="xl">
                                    <IconBrandTwitter size={20} stroke={1.5} />
                                </ActionIcon>
                                <ActionIcon size="lg" color="red" variant="light" radius="xl">
                                    <IconBrandYoutube size={20} stroke={1.5} />
                                </ActionIcon>
                                <ActionIcon size="lg" color="pink" variant="light" radius="xl">
                                    <IconBrandInstagram size={20} stroke={1.5} />
                                </ActionIcon>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}
