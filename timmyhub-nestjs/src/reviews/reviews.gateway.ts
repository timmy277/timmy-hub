/**
 * Reviews WebSocket Gateway
 * Cho phép client subscribe vào room product:{id} để nhận review mới real-time
 */
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL?.split(',') ?? 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/reviews',
})
export class ReviewsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(ReviewsGateway.name);

    handleConnection(client: Socket) {
        this.logger.debug(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id}`);
    }

    /** Client join vào room của product để nhận review real-time */
    @SubscribeMessage('join:product')
    handleJoinProduct(@MessageBody() productId: string, @ConnectedSocket() client: Socket) {
        void client.join(`product:${productId}`);
        this.logger.debug(`Client ${client.id} joined product:${productId}`);
    }

    /** Client rời room khi unmount */
    @SubscribeMessage('leave:product')
    handleLeaveProduct(@MessageBody() productId: string, @ConnectedSocket() client: Socket) {
        void client.leave(`product:${productId}`);
    }

    /** Emit review mới tới tất cả client đang subscribe product đó */
    emitNewReview(productId: string, review: unknown) {
        this.server.to(`product:${productId}`).emit('review:new', review);
    }

    /** Emit cập nhật rating summary sau khi có review mới */
    emitRatingUpdated(productId: string, data: { ratingAvg: number; ratingCount: number }) {
        this.server.to(`product:${productId}`).emit('rating:updated', data);
    }
}
