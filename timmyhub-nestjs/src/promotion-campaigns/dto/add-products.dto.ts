import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddProductsToCampaignSchema = z.object({
    productIds: z.array(z.string().cuid()).min(1, 'Phải có ít nhất 1 sản phẩm'),
    campaignPrice: z.number().positive().optional(),
    discountPercent: z.number().int().min(1).max(99).optional(),
    maxQuantity: z.number().int().positive().optional(),
});

export class AddProductsToCampaignDto extends createZodDto(AddProductsToCampaignSchema) {}
