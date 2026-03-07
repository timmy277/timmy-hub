/** Reviews Module — REST API + Socket.io Gateway */
import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsGateway } from './reviews.gateway';
import { PrismaService } from '../database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewsGateway, PrismaService],
    exports: [ReviewsService, ReviewsGateway],
})
export class ReviewsModule {}
