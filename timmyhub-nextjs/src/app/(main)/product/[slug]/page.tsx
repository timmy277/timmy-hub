import { Metadata } from 'next';
import { productService } from '@/services/product.service';
import { Title, Text, Container, Image, Group, Badge, Stack, Grid, Card, Button } from '@mantine/core';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    try {
        const response = await productService.getProductBySlug(slug);
        const product = response.data;

        return {
            title: `${product.name} | TimmyHub`,
            description: product.description ?? undefined,
            openGraph: {
                title: product.name,
                description: product.description ?? undefined,
                images: product.images?.[0] ? [{ url: product.images[0] }] : [],
            },
        };
    } catch {
        return {
            title: 'Sản phẩm không tồn tại | TimmyHub',
        };
    }
}

export default async function ProductDetailPage({ params }: Props) {
    const slug = (await params).slug;
    
    let product;
    try {
        const response = await productService.getProductBySlug(slug);
        product = response.data;
    } catch {
        notFound();
    }

    if (!product) notFound();

    return (
        <Container size="lg" py="xl">
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Image
                        src={product.images?.[0] || 'https://placehold.co/600x600?text=No+Image'}
                        radius="md"
                        alt={product.name}
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="md">
                        <Badge size="lg" variant="light">{product.category?.name || 'Category'}</Badge>
                        <Title order={1}>{product.name}</Title>
                        <Text size="xl" fw={700} c="blue" style={{ fontSize: '2rem' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </Text>
                        
                        <Card withBorder radius="md" p="md">
                            <Text fw={500} mb="xs">Mô tả sản phẩm</Text>
                            <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-line' }}>
                                {product.description}
                            </Text>
                        </Card>

                        <Group mt="xl">
                            <Button size="lg" radius="md" fullWidth>
                                Thêm vào giỏ hàng
                            </Button>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
