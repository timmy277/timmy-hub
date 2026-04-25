import type { OrderStatus } from '@/types/order';

export const ORDER_ALL_VALUE = 'all' as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    PACKED: 'Đã đóng gói',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    RETURN_REQUESTED: 'Yêu cầu trả hàng',
    RETURNED: 'Đã trả hàng',
    REFUNDED: 'Đã hoàn tiền',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
    PENDING: 'gray',
    CONFIRMED: 'teal',
    PROCESSING: 'blue',
    PACKED: 'teal',
    SHIPPING: 'blue',
    DELIVERED: 'green',
    COMPLETED: 'green',
    CANCELLED: 'red',
    RETURN_REQUESTED: 'orange',
    RETURNED: 'orange',
    REFUNDED: 'red',
};

export function getOrderStatusColor(status: OrderStatus): string {
    return ORDER_STATUS_COLORS[status] ?? 'gray';
}

/** Danh sách tất cả trạng thái (dùng trong dropdown filter) */
export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
    Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]
).map(value => ({ value, label: ORDER_STATUS_LABELS[value] }));

/** Danh sách kèm option "Tất cả" (dùng trong tab/filter người dùng) */
export const ORDER_STATUS_LIST: { value: OrderStatus | typeof ORDER_ALL_VALUE; label: string }[] = [
    { value: ORDER_ALL_VALUE, label: 'Tất cả' },
    ...ORDER_STATUS_OPTIONS,
];
