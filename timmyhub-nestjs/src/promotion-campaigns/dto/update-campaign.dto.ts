import { createZodDto } from 'nestjs-zod';
import { UpdateCampaignSchema } from '@timmyhub/shared';

export class UpdateCampaignDto extends createZodDto(UpdateCampaignSchema) {}
