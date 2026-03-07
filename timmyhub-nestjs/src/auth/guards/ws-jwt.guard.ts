import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() !== 'ws') {
            return true;
        }

        const client: Socket = context.switchToWs().getClient<Socket>();
        const token = this.extractTokenFromHeader(client);

        if (!token) {
            this.logger.warn(`No token provided by client: ${client.id}`);
            throw new WsException('Unauthorized access');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.isActive) {
                throw new WsException('User not found or inactive');
            }

            client.data.user = {
                id: user.id,
                email: user.email,
                roles: Array.isArray(user.roles) ? user.roles : [],
                deviceId: payload.deviceId || null,
            } as AuthenticatedUser;

            return true;
        } catch (error) {
            this.logger.warn(`Invalid token: ${(error as Error).message}`);
            throw new WsException('Unauthorized access');
        }
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
        const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
        if (type === 'Bearer') {
            return token;
        }
        const auth = client.handshake.auth;
        if (auth && auth.token) {
            return auth.token as string;
        }
        if (client.handshake.headers.cookie) {
            const cookies = client.handshake.headers.cookie.split(';');
            const accessTokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
            if (accessTokenCookie) {
                return accessTokenCookie.split('=')[1];
            }
        }
        return undefined;
    }
}
