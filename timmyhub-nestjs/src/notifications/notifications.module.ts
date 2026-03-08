import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
    imports: [AuthModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsGateway, PrismaService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
