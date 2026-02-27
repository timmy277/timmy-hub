'use client';

import { Container, Title, Text, Paper, Button } from '@mantine/core';
import Link from 'next/link';

export default function SellerProductsPage() {
    return (
        <Container fluid p="md">
            <Title order={2} mb="xs">
                Sản phẩm
            </Title>
            <Text c="dimmed" size="sm" mb="md">
                Quản lý sản phẩm của gian hàng. Sử dụng API products (Seller tạo/sửa sản phẩm của mình).
            </Text>
            <Paper withBorder p="xl" radius="md">
                <Text size="sm" c="dimmed" mb="md">
                    Trang quản lý sản phẩm seller có thể dùng chung luồng đăng bán từ trang chủ hoặc tạo trang riêng tại đây.
                </Text>
                <Button component={Link} href="/" variant="light">
                    Về trang chủ
                </Button>
            </Paper>
        </Container>
    );
}
