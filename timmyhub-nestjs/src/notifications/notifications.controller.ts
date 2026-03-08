import { Controller, Get, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    getMyNotifications(
        @Request() req: { user: { id: string } },
        @Query() query: NotificationQueryDto,
    ) {
        return this.notificationsService.getMyNotifications(req.user.id, query);
    }

    @Get('unread-count')
    getUnreadCount(@Request() req: { user: { id: string } }) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Patch('read-all')
    readAll(@Request() req: { user: { id: string } }) {
        return this.notificationsService.readAll(req.user.id);
    }

    @Patch(':id/read')
    readOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
        return this.notificationsService.readOne(id, req.user.id);
    }
}
