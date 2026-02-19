'use client';

import { ActionIcon, Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
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
                leftSection={<IconShoppingCart size={18} stroke={1.5} />}
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
            <IconShoppingCart size={18} stroke={1.5} />
        </ActionIcon>
    );
}
