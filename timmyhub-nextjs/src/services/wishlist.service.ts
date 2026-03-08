import axiosClient from "@/libs/axios";

export interface WishlistItem {
    id: string;
    userId: string;
    productId: string;
    createdAt: string;
    product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
        price: number;
        originalPrice: number | null;
        discount: number;
        ratingAvg: number;
        ratingCount: number;
        soldCount: number;
        stock: number;
    };
}

export const wishlistService = {
    async getMyWishlist(): Promise<WishlistItem[]> {
        const response = await axiosClient.get('/wishlists');
        return (response || []) as unknown as WishlistItem[];
    },

    async toggle(productId: string): Promise<{ message: string; isWishlisted: boolean }> {
        const response = await axiosClient.post(
            `/wishlists/${productId}/toggle`
        );
        return (response || { message: '', isWishlisted: false }) as unknown as { message: string; isWishlisted: boolean };
    },

    async check(productId: string): Promise<{ isWishlisted: boolean }> {
        const response = await axiosClient.get(`/wishlists/${productId}/check`);
        return (response || { isWishlisted: false }) as unknown as { isWishlisted: boolean };
    },
};
