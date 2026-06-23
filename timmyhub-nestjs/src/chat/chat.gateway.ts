import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { Logger, UseGuards, Inject } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL?.split(',') ?? 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(ChatGateway.name);

    private socketUserMap = new Map<string, string>();

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
        private readonly notificationsService: NotificationsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async handleConnection(client: Socket) {
        try {
            // Xác thực token thủ công khi connect
            let token: string | undefined =
                (client.handshake.auth?.token as string | undefined) ||
                client.handshake.headers.authorization?.split(' ')[1];

            if (!token && client.handshake.headers.cookie) {
                const cookies = client.handshake.headers.cookie.split(';');
                const accessTokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
                if (accessTokenCookie) {
                    token = accessTokenCookie.split('=')[1];
                }
            }

            if (!token || typeof token !== 'string') {
                this.logger.warn(`No valid token provided, disconnecting Socket ${client.id}`);
                return client.disconnect();
            }

            // TypeScript now knows token is string
            const payload = await this.jwtService.verifyAsync(token);
            if (payload && payload.sub && typeof payload.sub === 'string') {
                const userId = payload.sub as string;
                // Join vào room cá nhân của user
                await client.join(`user_${userId}`);
                this.logger.log(`Client connected and joined user_${userId}: ${client.id}`);
            } else {
                client.disconnect();
            }
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('chat:send')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { receiverId: string; content: string },
    ) {
        const user = client.data.user as AuthenticatedUser;
        if (!user) throw new WsException('Unauthorized');

        if (!data.content || !data.receiverId) {
            throw new WsException('Yêu cầu nội dung và người nhận');
        }

        // --- XỬ LÝ CHO AI BOT ---
        if (data.receiverId === 'ai-assistant-bot') {
            const userMessage = {
                id: randomUUID(),
                senderId: user.id,
                receiverId: 'ai-assistant-bot',
                content: data.content,
                createdAt: new Date().toISOString(),
                sender: {
                    id: user.id,
                    profile: user['profile'] || { displayName: 'You', avatar: null },
                },
            };

            this.server.to(`user_${user.id}`).emit('chat:receive', userMessage);

            try {
                // Initialize GenAI
                const ai = new GoogleGenAI({
                    apiKey: process.env.GEMINI_API_KEY || '',
                });

                // Tạm thời gọi API xử lý văn bản cơ bản
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Bạn là TimmyHub AI, trợ lý hỗ trợ khách hàng của hệ thống cửa hàng thương mại điện tử TimmyHub. Hãy trả lời ngắn gọn, thân thiện bằng ngôn ngữ của người dùng. Câu hỏi của khách là: ${data.content}`,
                });

                const botMessage = {
                    id: randomUUID(),
                    senderId: 'ai-assistant-bot',
                    receiverId: user.id,
                    content:
                        response.text || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.',
                    createdAt: new Date().toISOString(),
                    sender: {
                        id: 'ai-assistant-bot',
                        profile: { displayName: 'Trợ lý AI', avatar: null },
                    },
                };

                this.server.to(`user_${user.id}`).emit('chat:receive', botMessage);
            } catch (err) {
                this.logger.error('Lỗi khi gọi AI:', err);
                const botMessage = {
                    id: randomUUID(),
                    senderId: 'ai-assistant-bot',
                    receiverId: user.id,
                    content: 'Hệ thống AI đang tạm thời gián đoạn. Xin lỗi bạn vì sự bất tiện này.',
                    createdAt: new Date().toISOString(),
                    sender: {
                        id: 'ai-assistant-bot',
                        profile: { displayName: 'Trợ lý AI', avatar: null },
                    },
                };
                this.server.to(`user_${user.id}`).emit('chat:receive', botMessage);
            }

            return { status: 'ok', message: userMessage };
        }
        // -----------------------

        // Lưu tin nhắn vào DB
        const message = await this.chatService.saveMessage(user.id, data.receiverId, data.content);

        // Gửi qua socket cho người nhận
        this.server.to(`user_${data.receiverId}`).emit('chat:receive', message);
        // Gửi lại cho các tab khác của chính người gửi (để đồng bộ)
        this.server.to(`user_${user.id}`).emit('chat:receive', message);

        // Bắn thông báo
        await this.notificationsService.create({
            userId: data.receiverId,
            type: NotificationType.MESSAGE,
            title: 'Tin nhắn mới',
            content: `Bạn có tin nhắn mới từ ${user['profile']?.displayName || 'một người dùng'}`,
            link: ``, // Tích hợp mở popup tin nhắn thì có thể không cần link
        });

        return { status: 'ok', message };
    }
}
