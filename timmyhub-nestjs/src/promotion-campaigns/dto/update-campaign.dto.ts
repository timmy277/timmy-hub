import { PartialType } from '@nestjs/swagger';
import { CreatePromotionCampaignDto } from './create-campaign.dto';

export class UpdatePromotionCampaignDto extends PartialType(CreatePromotionCampaignDto) {}
