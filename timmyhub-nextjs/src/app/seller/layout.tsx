import { SellerLayoutContent } from '@/features/seller/SellerLayoutContent';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return <SellerLayoutContent>{children}</SellerLayoutContent>;
}
