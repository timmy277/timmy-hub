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
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';

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

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) {}

    async handleConnection(client: Socket) {
        try {
            // Xác thực token thủ công khi connect
            let token =
                client.handshake.auth?.token ||
                client.handshake.headers.authorization?.split(' ')[1];

            if (!token && client.handshake.headers.cookie) {
                const cookies = client.handshake.headers.cookie.split(';');
                const accessTokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
                if (accessTokenCookie) {
                    token = accessTokenCookie.split('=')[1];
                }
            }

            if (!token) {
                this.logger.warn(`No token provided, disconnecting Socket ${client.id}`);
                return client.disconnect();
            }

            const payload = await this.jwtService.verifyAsync(token);
            if (payload && payload.sub) {
                // Join vào room cá nhân của user
                client.join(`user_${payload.sub}`);
                this.logger.log(`Client connected and joined user_${payload.sub}: ${client.id}`);
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

        // Lưu tin nhắn vào DB
        const message = await this.chatService.saveMessage(user.id, data.receiverId, data.content);

        // Gửi qua socket cho người nhận
        this.server.to(`user_${data.receiverId}`).emit('chat:receive', message);
        // Gửi lại cho các tab khác của chính người gửi (để đồng bộ)
        this.server.to(`user_${user.id}`).emit('chat:receive', message);

        return { status: 'ok', message };
    }
}
