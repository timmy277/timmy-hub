import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { Notification } from '@prisma/client';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
    namespace: 'notifications',
    cors: {
        origin: true,
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(NotificationsGateway.name);

    async handleConnection(client: Socket) {
        try {
            const user = client.data.user;
            if (user) {
                await client.join(`user_${user.id}`);
            }
        } catch {
            client.disconnect(true);
        }
    }

    handleDisconnect() {
        // user leaves room automagically
    }

    /**
     * Bắn tín hiệu notification mới cho user
     */
    emitNewNotification(userId: string, notification: Notification) {
        this.server.to(`user_${userId}`).emit('notification:new', notification);
    }
}
