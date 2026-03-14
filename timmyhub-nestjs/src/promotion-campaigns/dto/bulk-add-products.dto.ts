import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema for individual product pricing in bulk add
export const CampaignProductItemSchema = z.object({
    productId: z.string().cuid(),
    campaignPrice: z.number().positive().optional(),
    discountPercent: z.number().int().min(1).max(99).optional(),
    maxQuantity: z.number().int().positive().optional(),
});

// Schema for bulk add with individual prices
export const BulkAddProductsToCampaignSchema = z.object({
    products: z.array(CampaignProductItemSchema).min(1, 'Phải có ít nhất 1 sản phẩm'),
});

export class BulkAddProductsToCampaignDto extends createZodDto(BulkAddProductsToCampaignSchema) {}

// Schema for updating a single product's price in campaign
export const UpdateCampaignProductSchema = z.object({
    campaignPrice: z.number().positive().optional(),
    discountPercent: z.number().int().min(1).max(99).optional(),
    maxQuantity: z.number().int().positive().optional(),
});

export class UpdateCampaignProductDto extends createZodDto(UpdateCampaignProductSchema) {}
