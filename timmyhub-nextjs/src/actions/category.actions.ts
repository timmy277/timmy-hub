'use server';

import { actionClient } from '@/libs/safe-action';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const categorySchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    parentId: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});

/**
 * Tạo danh mục
 */
export const createCategoryAction = actionClient
    .schema(categorySchema)
    .action(async ({ parsedInput: data }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create category');
        }

        revalidatePath('/admin/categories');
        return await res.json();
    });

/**
 * Cập nhật danh mục
 */
export const updateCategoryAction = actionClient
    .schema(z.object({
        id: z.string(),
        data: categorySchema.partial()
    }))
    .action(async ({ parsedInput: { id, data } }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update category');
        }

        revalidatePath('/admin/categories');
        return await res.json();
    });

/**
 * Xóa danh mục
 */
export const deleteCategoryAction = actionClient
    .schema(z.object({ id: z.string() }))
    .action(async ({ parsedInput: { id } }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Cookie': `access_token=${accessToken}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete category');
        }

        revalidatePath('/admin/categories');
        return { success: true };
    });
