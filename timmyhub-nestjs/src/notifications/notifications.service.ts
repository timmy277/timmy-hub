import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) {}

    async create(createDto: CreateNotificationDto) {
        const notif = await this.prisma.notification.create({
            data: {
                userId: createDto.userId,
                type: createDto.type,
                title: createDto.title,
                content: createDto.content,
                link: createDto.link,
            },
        });

        // Bắn realtime cho user
        this.notificationsGateway.emitNewNotification(createDto.userId, notif);

        return notif;
    }

    async getMyNotifications(userId: string, query: NotificationQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    async readOne(id: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    async readAll(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}
