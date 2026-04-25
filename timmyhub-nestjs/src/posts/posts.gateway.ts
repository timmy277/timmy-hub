import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { PostsService } from './posts.service';

@WebSocketGateway({ namespace: '/posts', cors: { origin: '*' } })
export class PostsGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private postsService: PostsService) {}

    handleDisconnect(client: Socket) {
        // Leave tất cả rooms khi disconnect
        client.rooms.forEach(room => {
            if (room !== client.id) void client.leave(room);
        });
    }

    /** Client join room của 1 post để nhận realtime */
    @SubscribeMessage('post:join')
    handleJoin(@MessageBody() postId: string, @ConnectedSocket() client: Socket) {
        void client.join(`post:${postId}`);
        return { event: 'post:joined', data: postId };
    }

    @SubscribeMessage('post:leave')
    handleLeave(@MessageBody() postId: string, @ConnectedSocket() client: Socket) {
        void client.leave(`post:${postId}`);
    }

    /** Gửi comment mới tới tất cả client đang xem post */
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('post:comment')
    async handleComment(
        @MessageBody() payload: { postId: string; content: string; parentId?: string },
        @ConnectedSocket() client: Socket & { user?: { id: string } },
    ) {
        if (!client.user?.id) return;

        const comment = await this.postsService.addComment(
            payload.postId,
            client.user.id,
            payload.content,
            payload.parentId,
        );

        // Broadcast tới tất cả trong room (kể cả người gửi)
        this.server.to(`post:${payload.postId}`).emit('post:new_comment', comment);
        return comment;
    }

    /** Broadcast like update */
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('post:like')
    async handleLike(
        @MessageBody() postId: string,
        @ConnectedSocket() client: Socket & { user?: { id: string } },
    ) {
        if (!client.user?.id) return;

        const result = await this.postsService.toggleLike(postId, client.user.id);

        this.server.to(`post:${postId}`).emit('post:like_update', {
            postId,
            liked: result.liked,
            userId: client.user.id,
        });

        return result;
    }

    /** Helper để emit từ service/controller khác */
    emitNewComment(postId: string, comment: unknown) {
        this.server.to(`post:${postId}`).emit('post:new_comment', comment);
    }
}
