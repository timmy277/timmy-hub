export interface Category {
    id: string;
    parentId?: string | null;
    name: string;
    slug: string;
    image?: string | null;
    description?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    children?: Category[];
}

export interface CreateCategoryInput {
    name: string;
    slug: string;
    parentId?: string;
    image?: string;
    description?: string;
    isActive?: boolean;
}
