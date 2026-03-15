/**
 * Seller Products Page - quản lý sản phẩm gian hàng
 * Layout (DashboardShell + breadcrumb) được inject bởi seller/layout.tsx
 */
import { SellerProductList } from '@/features/seller/products/SellerProductList';

export default function SellerProductsPage() {
    return <SellerProductList />;
}