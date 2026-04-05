export interface PostProduct {
    id: string;
    productId: string;
    position: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        originalPrice: number | null;
        images: string[];
        ratingAvg: number;
    };
}

export interface Post {
    id: string;
    sellerId: string;
    title: string;
    content: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    images: string[];
    hashtags: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    seller: {
        id: string;
        profile: {
            displayName: string | null;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
        } | null;
        sellerProfile: { shopName: string; shopSlug: string; shopLogo: string | null } | null;
    };
    productTags: PostProduct[];
    _count: { likes: number; comments: number };
}

export interface PostComment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    parentId: string | null;
    createdAt: string;
}

export interface CreatePostInput {
    title: string;
    content?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    images?: string[];
    hashtags?: string[];
    productIds?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
}

export interface PostFeedResponse {
    data: Post[];
    nextCursor: string | null;
    hasMore: boolean;
}
