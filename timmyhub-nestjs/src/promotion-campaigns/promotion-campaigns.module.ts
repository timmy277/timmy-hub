import { Module } from '@nestjs/common';
import { PromotionCampaignsService } from './promotion-campaigns.service';
import { PromotionCampaignsController } from './promotion-campaigns.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [PromotionCampaignsController],
    providers: [PromotionCampaignsService],
    exports: [PromotionCampaignsService],
})
export class PromotionCampaignsModule {}
