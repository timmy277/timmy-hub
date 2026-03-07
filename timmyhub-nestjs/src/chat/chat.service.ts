import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async getAdminUser() {
        // Tìm 1 admin bất kỳ (ở đây lấy user có role ADMIN đầu tiên)
        const admin = await this.prisma.user.findFirst({
            where: { roles: { has: UserRole.ADMIN } },
            include: { profile: true },
        });

        // Nếu database chưa có ADMIN thực sự nào, có thể giả lập hoặc báo lỗi.
        // Tạm thời nếu ko có, ta tạo 1 mock admin id để code ko crash (hoặc throw lỗi)
        // Nhưng tốt nhất nên seed 1 admin.
        if (!admin) {
            throw new NotFoundException('Không tìm thấy Admin nào trong hệ thống');
        }

        return {
            id: admin.id,
            displayName: admin.profile?.displayName || 'Admin TimmyHub',
            avatar: admin.profile?.avatar || null,
        };
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

        // Trả về reverse để render chat từ trên xuống dưới
        return messages.reverse();
    }

    async saveMessage(senderId: string, receiverId: string, content: string) {
        // TODO: Optimize Database Writes with Redis Buffer (Write-Behind Caching)
        // Khi hệ thống có lượng tin nhắn lớn tải lên cùng lúc, cân nhắc đổi logic sau:
        // 1. Thay vì gọi trực tiếp `prisma.chatMessage.create`, hãy đẩy object `message` vào Redis List (LPUSH `chat_buffer`)
        // 2. Tạo một CronJob hoặc Queue Worker chạy định kỳ (VD: mỗi 5-10s) sử dụng RPOP để lấy n messages từ Redis.
        // 3. Dùng `prisma.chatMessage.createMany` để chèn bulk mẻ tin nhắn đó vào DB giúp giảm tải IO cho Postgres.
        // 4. Lưu ý ở hàm `getMessages`: Sẽ cần lấy thêm dữ liệu tin nhắn nóng trong cấu trúc Redis và merge (kết hợp) với dữ liệu từ DB.

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
}
