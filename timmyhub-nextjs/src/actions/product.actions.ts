'use server';

import { actionClient } from '@/libs/safe-action';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Duyệt sản phẩm
 */
export const approveProductAction = actionClient
    .schema(z.object({ id: z.string() }))
    .action(async ({ parsedInput: { id } }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) {
            throw new Error('Unauthorized');
        }

        const res = await fetch(`${API_URL}/products/${id}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to approve product');
        }

        revalidatePath('/admin/products');
        return { success: true };
    });

/**
 * Từ chối sản phẩm
 */
export const rejectProductAction = actionClient
    .schema(z.object({ 
        id: z.string(),
        note: z.string().min(1, 'Vui lòng nhập lý do từ chối')
    }))
    .action(async ({ parsedInput: { id, note } }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) {
            throw new Error('Unauthorized');
        }

        const res = await fetch(`${API_URL}/products/${id}/reject`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`,
            },
            body: JSON.stringify({ note }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to reject product');
        }

        revalidatePath('/admin/products');
        return { success: true };
    });

const productInputSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().optional(),
    price: z.number().min(0),
    stock: z.number().min(0),
    sku: z.string().optional(),
    categoryId: z.string().min(1),
    images: z.array(z.string()).min(1),
});

/**
 * Tạo sản phẩm mới
 */
export const createProductAction = actionClient
    .schema(productInputSchema)
    .action(async ({ parsedInput: data }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create product');
        }

        revalidatePath('/admin/products');
        return await res.json();
    });

/**
 * Cập nhật sản phẩm
 */
export const updateProductAction = actionClient
    .schema(z.object({
        id: z.string(),
        data: productInputSchema
    }))
    .action(async ({ parsedInput: { id, data } }) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;

        if (!accessToken) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `access_token=${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update product');
        }

        revalidatePath('/admin/products');
        return await res.json();
    });
