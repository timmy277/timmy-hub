import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async getAdminUser() {
        const admin = await this.prisma.user.findFirst({
            where: { roles: { has: UserRole.ADMIN } },
            include: { profile: true },
        });

        if (!admin) {
            throw new NotFoundException('Không tìm thấy Admin nào trong hệ thống');
        }

        return {
            id: admin.id,
            displayName: admin.profile?.displayName || 'Admin TimmyHub',
            avatar: admin.profile?.avatar || null,
        };
    }

    async getContacts(userId: string) {
        // Lấy lịch sử chat gần đây liên quan đến user này (admin)
        const messages = await this.prisma.chatMessage.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            take: 2000,
            select: {
                senderId: true,
                receiverId: true,
                content: true,
                createdAt: true,
            },
        });

        const map = new Map<
            string,
            { lastMessage: string; lastMessageAt: Date; contactId: string }
        >();
        for (const m of messages) {
            const contactId = m.senderId === userId ? m.receiverId : m.senderId;
            if (!map.has(contactId)) {
                map.set(contactId, {
                    lastMessage: m.content,
                    lastMessageAt: m.createdAt,
                    contactId,
                });
            }
        }

        const contactIds = Array.from(map.keys());
        if (contactIds.length === 0) return [];

        const users = await this.prisma.user.findMany({
            where: { id: { in: contactIds } },
            include: { profile: true },
        });

        const contacts = users.map(u => {
            const info = map.get(u.id)!;
            return {
                id: u.id,
                displayName: u.profile?.displayName || u.email,
                avatar: u.profile?.avatar || null,
                lastMessage: info.lastMessage,
                lastMessageAt: info.lastMessageAt,
            };
        });

        // Xếp theo tin nhắn mới nhất
        return contacts.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    }

    async getMessages(userId: string, contactId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;

        const messages = await this.prisma.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: { select: { displayName: true, avatar: true } },
                    },
                },
            },
        });

        return messages.reverse();
    }

    async saveMessage(senderId: string, receiverId: string, content: string) {
        const message = await this.prisma.chatMessage.create({
            data: {
                senderId,
                receiverId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: { select: { displayName: true, avatar: true } },
                    },
                },
            },
        });

        return message;
    }

    async getUnreadCounts(userId: string): Promise<Record<string, number>> {
        // Đếm số tin nhắn chưa đọc, nhóm theo senderId (người gửi)
        const unreadMessages = await this.prisma.chatMessage.groupBy({
            by: ['senderId'],
            where: {
                receiverId: userId,
                isRead: false,
            },
            _count: {
                id: true,
            },
        });

        const unreadCounts: Record<string, number> = {};
        for (const item of unreadMessages) {
            unreadCounts[item.senderId] = item._count.id;
        }

        return unreadCounts;
    }

    async getTotalUnreadCount(userId: string): Promise<number> {
        return this.prisma.chatMessage.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });
    }

    async markAsRead(userId: string, contactId: string): Promise<number> {
        const result = await this.prisma.chatMessage.updateMany({
            where: {
                senderId: contactId,
                receiverId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return result.count;
    }

    async markAllAsRead(userId: string): Promise<number> {
        const result = await this.prisma.chatMessage.updateMany({
            where: {
                receiverId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return result.count;
    }
}
