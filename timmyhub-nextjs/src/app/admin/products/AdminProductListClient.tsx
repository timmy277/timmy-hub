'use client';

import dynamic from 'next/dynamic';
import { ProductListSkeleton } from '@/components/shared/LoadingFallback';

const ProductList = dynamic(
    () => import('@/features/admin').then(mod => ({ default: mod.ProductList })),
    {
        loading: () => <ProductListSkeleton />,
        ssr: false,
    },
);

export function AdminProductListClient() {
    return <ProductList />;
}
