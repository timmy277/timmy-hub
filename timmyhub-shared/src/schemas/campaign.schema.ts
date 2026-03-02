/**
 * Zod schema cho Promotion Campaign - dùng chung giữa frontend và backend
 */
import { z } from 'zod';

export const CAMPAIGN_TYPES = [
  'VOUCHER_CAMPAIGN',
  'FLASH_SALE',
  'CATEGORY_SALE',
  'EVENT',
] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_OWNER_TYPES = ['PLATFORM', 'SELLER'] as const;
export type CampaignOwnerType = (typeof CAMPAIGN_OWNER_TYPES)[number];

const BaseCampaignSchema = z.object({
  name: z.string().min(3, 'Tên chiến dịch phải ít nhất 3 ký tự').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(CAMPAIGN_TYPES),
  startDate: z.string().datetime({ message: 'Ngày bắt đầu không hợp lệ' }).optional(),
  endDate: z.string().datetime({ message: 'Ngày kết thúc không hợp lệ' }).optional(),
  isActive: z.boolean().default(true),
  ownerType: z.enum(CAMPAIGN_OWNER_TYPES).optional(),
  ownerId: z.string().cuid().optional().nullable(),
});

export const CreateCampaignSchema = BaseCampaignSchema
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['endDate'],
    },
  )
  .refine(
    (data) => !(data.ownerType === 'SELLER' && !data.ownerId),
    {
      message: 'ownerId là bắt buộc khi ownerType là SELLER',
      path: ['ownerId'],
    },
  );

// UpdateCampaignSchema dùng base object (không refine) để partial() hoạt động
export const UpdateCampaignSchema = BaseCampaignSchema.partial();

export type CreateCampaignDto = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignDto = z.infer<typeof UpdateCampaignSchema>;
