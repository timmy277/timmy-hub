import { Category } from './category';

export interface SellerProfileInfo {
    id: string;
    shopName: string;
    shopSlug: string;
    shopLogo?: string | null;
    description?: string | null;
    isVerified: boolean;
    rating: number;
}

export interface SellerBasicInfo {
    id: string;
    email: string;
    profile?: {
        firstName: string;
        lastName: string;
        displayName: string;
        avatar?: string;
    } | null;
    sellerProfile?: SellerProfileInfo | null;
}

export interface SellerShop extends SellerProfileInfo {
    userId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        profile?: {
            firstName: string;
            lastName: string;
            displayName: string;
            avatar?: string;
        } | null;
    };
    products: Product[];
}

export enum ResourceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DELETED = 'DELETED',
}

export interface ProductVariant {
    id: string;
    productId: string;
    name: string;
    sku?: string | null;
    price: number;
    stock: number;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    sellerId: string;
    seller?: SellerBasicInfo | null;
    brandId?: string | null;
    categoryId?: string | null;
    category?: Category | null;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    discount?: number | null;
    stock: number;
    sku?: string | null;
    images: string[];

    // Shipping
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;

    // Dynamic content
    attributes?: Record<string, unknown> | null;
    specifications?: Record<string, unknown> | null;

    // Statistics
    soldCount: number;
    viewCount: number;
    ratingAvg: number;
    ratingCount: number;

    // Flags
    isFeatured: boolean;
    isNew: boolean;

    status: ResourceStatus;
    reviewNote?: string | null;
    createdAt: string;
    updatedAt: string;
    variants?: ProductVariant[];
}

export interface CreateProductInput {
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    sku?: string;
    categoryId?: string;
    images?: string[];
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    isActive: boolean;
}

export interface Seller {
    id: string;
    email: string;
    shopName?: string | null;
    shopSlug?: string | null;
    profile?: {
        firstName: string;
        lastName: string;
        displayName: string;
        avatar?: string;
    } | null;
}
