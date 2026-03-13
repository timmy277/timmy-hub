'use client';

import { ActionIcon, Button } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useCart } from '@/hooks/useCart';

interface AddToCartButtonProps {
    productId: string;
    quantity?: number;
    variant?: 'icon' | 'button';
    disabled?: boolean;
}

export function AddToCartButton({
    productId,
    quantity = 1,
    variant = 'icon',
    disabled = false,
}: AddToCartButtonProps) {
    const { addToCart, isAdding } = useCart();

    const handleAddToCart = () => {
        void addToCart({ productId, quantity });
    };

    if (variant === 'button') {
        return (
            <Button
                leftSection={<Iconify icon="solar:cart-plus-bold" width={18} />}
                onClick={handleAddToCart}
                loading={isAdding}
                disabled={disabled}
                fullWidth
            >
                Thêm vào giỏ
            </Button>
        );
    }

    return (
        <ActionIcon
            variant="filled"
            color="blue"
            size="lg"
            radius="md"
            onClick={handleAddToCart}
            loading={isAdding}
            disabled={disabled}
        >
            <Iconify icon="solar:cart-plus-bold" width={18} />
        </ActionIcon>
    );
}
