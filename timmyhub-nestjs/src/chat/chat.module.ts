import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';

@Module({
    imports: [AuthModule],
    providers: [ChatService, ChatGateway, PrismaService],
    controllers: [ChatController],
})
export class ChatModule {}
