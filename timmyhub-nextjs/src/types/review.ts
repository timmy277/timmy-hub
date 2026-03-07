/** Types cho Review module */

export interface ReviewUser {
    id: string;
    profile: {
        displayName: string;
        avatar?: string | null;
    } | null;
}

export interface ReviewComment {
    id: string;
    reviewId: string;
    userId: string;
    content: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    user: ReviewUser;
    replies?: ReviewComment[];
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
    hasVotedHelpful?: boolean;
    createdAt: string;
    updatedAt: string;
    user: ReviewUser;
    comments: ReviewComment[];
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
