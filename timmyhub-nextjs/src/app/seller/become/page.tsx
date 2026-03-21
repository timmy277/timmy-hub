import { redirect } from 'next/navigation';
import { BECOME_SELLER_PATH } from '@/constants/become-seller';

export default function LegacyBecomeSellerPage(): never {
    redirect(BECOME_SELLER_PATH);
}
