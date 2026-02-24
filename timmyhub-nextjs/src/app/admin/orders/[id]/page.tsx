import { redirect } from 'next/navigation';

/** Chi tiết đơn hàng mở trong tab của trang danh sách. Redirect về /admin/orders. */
export default async function Page() {
    redirect('/admin/orders');
}
