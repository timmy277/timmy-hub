import { Metadata } from 'next';
import { productService } from '@/services/product.service';
import { notFound } from 'next/navigation';
import { SellerShopClient } from '@/features/sellers/components/SellerShopClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    try {
        const response = await productService.getSellerShop(slug);
        const shop = response.data;
        return {
            title: `${shop.shopName} | TimmyHub`,
            description: shop.description ?? `Gian hàng ${shop.shopName} trên TimmyHub`,
            openGraph: {
                title: `${shop.shopName} | TimmyHub`,
                description: shop.description ?? `Gian hàng ${shop.shopName} trên TimmyHub`,
                images: shop.shopLogo ? [{ url: shop.shopLogo }] : [],
            },
        };
    } catch {
        return { title: 'Gian hàng không tồn tại | TimmyHub' };
    }
}

export default async function SellerShopPage({ params }: Props) {
    const slug = (await params).slug;

    let shop;
    try {
        const response = await productService.getSellerShop(slug);
        shop = response.data;
    } catch {
        notFound();
    }

    if (!shop) notFound();

    return <SellerShopClient shop={shop} />;
}
