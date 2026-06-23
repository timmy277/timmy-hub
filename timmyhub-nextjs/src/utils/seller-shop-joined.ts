/**
 * Chuỗi "tham gia" tương đối từ createdAt (i18n keys sellerShop.joined*).
 */
import type { TFunction } from 'i18next';

export function formatShopJoinedRelative(createdAt: string, t: TFunction): string {
    const ms = Date.now() - new Date(createdAt).getTime();
    if (ms < 0) return t('sellerShop.joinedRecent');
    const years = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
    if (years >= 1) {
        return t('sellerShop.joinedYearsAgo', { count: years });
    }
    const months = Math.floor(ms / (30 * 24 * 60 * 60 * 1000));
    if (months >= 1) {
        return t('sellerShop.joinedMonthsAgo', { count: months });
    }
    return t('sellerShop.joinedRecent');
}
