
import { z } from 'zod';

export const CreateAddressSchema = z.object({
    label: z.string().max(100).optional(),
    fullName: z.string().min(1).max(200),
    phone: z.string().min(8).max(20),
    addressLine1: z.string().min(1).max(500),
    addressLine2: z.string().max(500).optional(),
    provinceCode: z.string().min(1).max(50),
    districtCode: z.string().min(1).max(50),
    wardCode: z.string().min(1).max(50),
    provinceName: z.string().max(200).optional(),
    districtName: z.string().max(200).optional(),
    wardName: z.string().max(200).optional(),
    isDefault: z.boolean().optional(),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
