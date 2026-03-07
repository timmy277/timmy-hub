/** Types cho Review module */

export interface ReviewUser {
    id: string;
    profile: {
        displayName: string;
        avatar?: string | null;
    } | null;
}

export interface Review {
    id: string;
    userId: string;
    productId: string;
    orderItemId: string | null;
    rating: number;
    comment: string | null;
    images: string[];
    videos: string[];
    isVerified: boolean;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
    user: ReviewUser;
}

export interface ReviewBreakdown {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

export interface ReviewListResponse {
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    ratingBreakdown: ReviewBreakdown;
}

export interface CreateReviewInput {
    productId: string;
    orderItemId: string;
    rating: number;
    comment?: string;
    images?: string[];
    videos?: string[];
}

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
