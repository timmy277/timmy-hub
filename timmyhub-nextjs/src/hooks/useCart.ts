import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { notifications } from '@mantine/notifications';
import { useAuth } from './useAuth';
import type { AddToCartDto, Cart, UpdateCartItemDto } from '@/types/cart';
import { QUERY_KEYS } from '@/constants';

/** @deprecated Dùng QUERY_KEYS.CART từ '@/constants' thay thế */
export const CART_QUERY_KEY = QUERY_KEYS.CART;

const EMPTY_CART: Cart = {
    id: null,
    items: [],
    itemCount: 0,
    totalAmount: 0,
};

function parseCartResponse(response: unknown): Cart {
    if (!response || typeof response !== 'object') return EMPTY_CART;
    const r = response as { data?: unknown };
    const payload = r.data ?? response;
    if (!payload || typeof payload !== 'object') return EMPTY_CART;
    const p = payload as { items?: unknown };
    return Array.isArray(p.items) ? (payload as Cart) : EMPTY_CART;
}

function showNotification(
    type: 'success' | 'error',
    title: string,
    message: string,
) {
    notifications.show({ title, message, color: type === 'success' ? 'green' : 'red' });
}

export function useCart() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const {
        data: cart = EMPTY_CART,
        isLoading,
        error,
        refetch: refetchCart,
    } = useQuery({
        queryKey: QUERY_KEYS.CART,
        queryFn: async () => {
            const response = await cartService.getCart();
            return parseCartResponse(response);
        },
        enabled: !!user,
        staleTime: 30_000,
        placeholderData: EMPTY_CART,
        retry: false,
    });

    const setCartData = (cart: Cart) =>
        queryClient.setQueryData(QUERY_KEYS.CART, cart);

    const updateQuantityOptimistic = (itemId: string, quantity: number) => {
        const currentCart = queryClient.getQueryData<Cart>(QUERY_KEYS.CART) ?? cart;
        const updatedItems = currentCart.items.map(item => {
            if (item.id === itemId) {
                const newSubtotal = Number(item.product.price) * quantity;
                return {
                    ...item,
                    quantity,
                    subtotal: newSubtotal,
                };
            }
            return item;
        });

        const updatedCart: Cart = {
            ...currentCart,
            items: updatedItems,
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: updatedItems.reduce((sum, item) => sum + item.subtotal, 0),
        };

        setCartData(updatedCart);
    };

    const addToCart = useMutation({
        mutationFn: (dto: AddToCartDto) => cartService.addToCart(dto),
        onSuccess: async (response) => {
            const cart = parseCartResponse(response);
            setCartData(cart);
            const msg =
                (response as { message?: string })?.message ?? 'Đã thêm vào giỏ hàng';
            showNotification('success', 'Thành công', msg);
        },
        onError: (err: Error) => {
            showNotification(
                'error',
                'Lỗi',
                err.message || 'Không thể thêm vào giỏ hàng',
            );
        },
    });

    const updateQuantity = useMutation({
        mutationFn: ({ itemId, dto }: { itemId: string; dto: UpdateCartItemDto }) =>
            cartService.updateQuantity(itemId, dto),
        onSuccess: async (response) => {
            const cart = parseCartResponse(response);
            setCartData(cart);
        },
        onError: (err: Error) => {
            showNotification('error', 'Lỗi', err.message || 'Không thể cập nhật');
        },
    });

    const removeItem = useMutation({
        mutationFn: (itemId: string) => cartService.removeItem(itemId),
        onSuccess: async (response) => {
            const cart = parseCartResponse(response);
            setCartData(cart);
            showNotification('success', 'Thành công', 'Đã xóa sản phẩm');
        },
        onError: (err: Error) => {
            showNotification('error', 'Lỗi', err.message || 'Không thể xóa');
        },
    });

    const clearCart = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: async () => {
            setCartData(EMPTY_CART);
            showNotification('success', 'Thành công', 'Đã xóa tất cả sản phẩm');
        },
        onError: (err: Error) => {
            showNotification(
                'error',
                'Lỗi',
                err.message || 'Không thể xóa giỏ hàng',
            );
        },
    });

    return {
        cart,
        isLoading,
        error,
        refetch: refetchCart,
        addToCart: addToCart.mutateAsync,
        updateQuantity: updateQuantity.mutateAsync,
        updateQuantityOptimistic,
        removeItem: removeItem.mutateAsync,
        clearCart: clearCart.mutateAsync,
        isAdding: addToCart.isPending,
        isUpdating: updateQuantity.isPending,
        isRemoving: removeItem.isPending,
        isClearing: clearCart.isPending,
    };
}
