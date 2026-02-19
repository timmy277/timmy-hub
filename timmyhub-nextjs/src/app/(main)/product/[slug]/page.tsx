import { Metadata } from 'next';
import { productService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/features/products/components/ProductDetailClient';

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

    return <ProductDetailClient product={product} />;
}
