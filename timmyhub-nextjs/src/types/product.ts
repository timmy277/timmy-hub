import { Category } from './category';
import { User } from './auth';

export enum ResourceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DELETED = 'DELETED',
}

export interface Product {
    id: string;
    sellerId: string;
    seller?: User | null;
    brandId?: string | null;
    categoryId?: string | null;
    category?: Category | null;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    stock: number;
    sku?: string | null;
    images: string[];
    status: ResourceStatus;
    reviewNote?: string | null;
    createdAt: string;
    updatedAt: string;
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
