import type { Metadata } from 'next';
import { BecomeSellerLandingPage } from '@/features/seller/BecomeSellerLandingPage';

export const metadata: Metadata = {
    title: 'Trở thành người bán | TimmyHub',
    description:
        'Đăng ký bán hàng trên TimmyHub — tiếp cận triệu khách hàng, quản lý gian hàng thông minh.',
};

export default function BecomeSellerPage() {
    return <BecomeSellerLandingPage />;
}
