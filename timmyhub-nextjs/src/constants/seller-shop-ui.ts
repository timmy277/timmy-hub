/**
 * Giá trị hiển thị tạm (chưa có API): người theo dõi, đánh giá tổng, tỉ lệ phản hồi, đang theo.
 */
export const SELLER_SHOP_HARDCODED = {
    followersDisplay: '15.5k',
    reviewsCountDisplay: '2.4k',
    responseRatePercent: 98,
    followingCountDisplay: '12',
} as const;

export const SELLER_SHOP_PAGE_SIZE = 12;

export type SellerShopSortMode = 'popular' | 'newest' | 'bestSelling' | 'priceAsc' | 'priceDesc';
