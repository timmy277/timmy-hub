import { Metadata } from 'next';
import { productService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/features/products/components/ProductDetailClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    let product: Awaited<ReturnType<typeof productService.getProductBySlug>>['data'] | null = null;
    try {
        const response = await productService.getProductBySlug(slug);
        product = response.data;
    } catch {
        return { title: 'Sản phẩm không tồn tại | TimmyHub' };
    }
    if (!product) return { title: 'Sản phẩm không tồn tại | TimmyHub' };
    const firstImage = product.images && product.images[0] ? product.images[0] : undefined;
    return {
        title: `${product.name} | TimmyHub`,
        description: product.description ?? undefined,
        openGraph: {
            title: product.name,
            description: product.description ?? undefined,
            images: firstImage ? [{ url: firstImage }] : [],
        },
    };
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
