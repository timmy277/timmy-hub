/**
 * Seller Products Page - quản lý sản phẩm gian hàng
 * Layout (DashboardShell + breadcrumb) được inject bởi seller/layout.tsx
 */
import { SellerProductList } from '@/features/seller/products/SellerProductList';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SellerProductsPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        redirect('/login?callbackUrl=/seller/products');
    }

    return <SellerProductList />;
}