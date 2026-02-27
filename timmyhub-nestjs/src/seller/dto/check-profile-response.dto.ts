import type { ResourceStatus, SellerProfile } from '@prisma/client';

/** Payload GET /seller/profile/check */
export interface CheckProfileResponseDto {
    hasSellerProfile: boolean;
    status: ResourceStatus | null;
    profile: SellerProfileSnapshot | null;
}

/** Bản rút gọn SellerProfile cho API, tránh lộ type Prisma */
export interface SellerProfileSnapshot {
    id: string;
    userId: string;
    shopName: string;
    shopSlug: string;
    shopLogo: string | null;
    description: string | null;
    status: ResourceStatus;
    isVerified: boolean;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

/** Map Prisma SellerProfile | null → DTO, type rõ ràng để tránh unsafe assignment */
export function toCheckProfileResponse(profile: SellerProfile | null): CheckProfileResponseDto {
    if (profile === null) {
        return { hasSellerProfile: false, status: null, profile: null };
    }
    const snapshot: SellerProfileSnapshot = {
        id: profile.id,
        userId: profile.userId,
        shopName: profile.shopName,
        shopSlug: profile.shopSlug,
        shopLogo: profile.shopLogo,
        description: profile.description,
        status: profile.status,
        isVerified: profile.isVerified,
        rating: profile.rating,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    };
    return {
        hasSellerProfile: true,
        status: profile.status,
        profile: snapshot,
    };
}
