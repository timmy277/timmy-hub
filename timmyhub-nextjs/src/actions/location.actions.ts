'use server';

import { actionClient } from '@/libs/safe-action';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ===== Province Actions =====

const provinceSchema = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200),
});

export const createProvinceAction = actionClient
    .schema(provinceSchema)
    .action(async ({ parsedInput: data }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/provinces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `access_token=${token}` },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create province');
        }
        revalidatePath('/admin/locations/provinces');
        return res.json();
    });

export const updateProvinceAction = actionClient
    .schema(z.object({ code: z.string(), data: provinceSchema.partial() }))
    .action(async ({ parsedInput: { code, data } }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/provinces/${code}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Cookie': `access_token=${token}` },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update province');
        }
        revalidatePath('/admin/locations/provinces');
        return res.json();
    });

export const deleteProvinceAction = actionClient
    .schema(z.object({ code: z.string() }))
    .action(async ({ parsedInput: { code } }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/provinces/${code}`, {
            method: 'DELETE',
            headers: { 'Cookie': `access_token=${token}` },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete province');
        }
        revalidatePath('/admin/locations/provinces');
        return { success: true };
    });

// ===== District Actions =====

const districtSchema = z.object({
    code: z.string().min(1).max(50),
    provinceCode: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200),
});

export const createDistrictAction = actionClient
    .schema(districtSchema)
    .action(async ({ parsedInput: data }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/districts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `access_token=${token}` },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create district');
        }
        revalidatePath('/admin/locations/districts');
        return res.json();
    });

export const updateDistrictAction = actionClient
    .schema(z.object({ code: z.string(), data: districtSchema.partial() }))
    .action(async ({ parsedInput: { code, data } }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/districts/${code}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Cookie': `access_token=${token}` },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update district');
        }
        revalidatePath('/admin/locations/districts');
        return res.json();
    });

export const deleteDistrictAction = actionClient
    .schema(z.object({ code: z.string() }))
    .action(async ({ parsedInput: { code } }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/districts/${code}`, {
            method: 'DELETE',
            headers: { 'Cookie': `access_token=${token}` },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete district');
        }
        revalidatePath('/admin/locations/districts');
        return { success: true };
    });

// ===== Ward Actions =====

const wardSchema = z.object({
    code: z.string().min(1).max(50),
    districtCode: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200),
});

export const createWardAction = actionClient
    .schema(wardSchema)
    .action(async ({ parsedInput: data }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/wards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `access_token=${token}` },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create ward');
        }
        revalidatePath('/admin/locations/wards');
        return res.json();
    });

export const updateWardAction = actionClient
    .schema(z.object({ code: z.string(), data: wardSchema.partial() }))
    .action(async ({ parsedInput: { code, data } }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/wards/${code}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Cookie': `access_token=${token}` },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update ward');
        }
        revalidatePath('/admin/locations/wards');
        return res.json();
    });

export const deleteWardAction = actionClient
    .schema(z.object({ code: z.string() }))
    .action(async ({ parsedInput: { code } }) => {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) throw new Error('Unauthorized');

        const res = await fetch(`${API_URL}/locations/wards/${code}`, {
            method: 'DELETE',
            headers: { 'Cookie': `access_token=${token}` },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete ward');
        }
        revalidatePath('/admin/locations/wards');
        return { success: true };
    });
