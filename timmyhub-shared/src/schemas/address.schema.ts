
import { z } from 'zod';

export const CreateAddressSchema = z.object({
    label: z.string().max(100).optional(),
    fullName: z.string().min(1).max(200),
    phone: z.string().min(8).max(20),
    addressLine1: z.string().min(1).max(500),
    addressLine2: z.string().max(500).optional(),
    ward: z.string().min(1).max(200),
    district: z.string().min(1).max(200),
    city: z.string().min(1).max(200),
    isDefault: z.boolean().optional(),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
