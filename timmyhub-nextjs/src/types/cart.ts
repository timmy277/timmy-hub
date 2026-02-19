import { Product } from './product';

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    subtotal: number;
}

export interface Cart {
    id: string | null;
    items: CartItem[];
    itemCount: number;
    totalAmount: number;
}

export interface AddToCartDto {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemDto {
    quantity: number;
}

export interface BulkAddToCartDto {
    items: AddToCartDto[];
}

export interface CartValidationError {
    itemId: string;
    productId: string;
    productName: string;
    message: string;
    availableStock?: number;
    requestedQuantity?: number;
}

export interface CartValidationResult {
    valid: boolean;
    errors: CartValidationError[];
    cart: Cart;
}
