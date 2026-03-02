import { createZodDto } from 'nestjs-zod';
import { CreateCampaignSchema } from '@timmyhub/shared';

export class CreateCampaignDto extends createZodDto(CreateCampaignSchema) {}
