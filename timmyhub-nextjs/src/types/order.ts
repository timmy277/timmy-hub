export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPING'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURNED'
    | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'COD' | 'STRIPE' | 'VNPAY' | 'WALLET';

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    name: string;
    image: string | null;
    price: number | string;
    quantity: number;
    subtotal: number | string;
    isReviewed: boolean;
}

export interface OrderUserProfile {
    firstName?: string;
    lastName?: string;
    displayName?: string | null;
}

export interface OrderUser {
    id: string;
    email?: string;
    profile?: OrderUserProfile | null;
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    totalAmount: number | string;
    /** Phí vận chuyển (API trả về từ Prisma) */
    shippingFee?: number | string;
    /** Giảm giá voucher (API trả về từ Prisma) */
    voucherDiscount?: number | string | null;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    createdAt: string;
    updatedAt: string;
    orderItems?: OrderItem[];
    payment?: Payment;
    /** Present when fetched by admin (list/detail) */
    user?: OrderUser;
}

export interface Payment {
    id: string;
    orderId: string;
    method: string;
    status: PaymentStatus;
    amount: number | string;
    vnpayTxnRef: string | null;
    vnpayTransNo: string | null;
    paidAt: string | null;
}

export interface CreateOrderFromCartDto {
    paymentMethod?: PaymentMethod;
    voucherCode?: string;
    addressId: string;
    customerNote?: string;
}

export interface CreateOrderFromCartResponse {
    id: string;
    status: OrderStatus;
    totalAmount: number | string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    orderItems: OrderItem[];
}

export interface CreateVnpayUrlDto {
    orderId: string;
}

export interface CreateVnpayUrlResponse {
    url: string;
    paymentId: string;
    orderId: string;
}
