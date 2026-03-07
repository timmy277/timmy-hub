import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    Req,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseDto } from '../common/dto/response.dto';
import type { UserRequest } from '../auth/interfaces/auth.interface';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('admin')
    @ApiOperation({ summary: 'Lấy thông tin Admin để liên hệ' })
    async getAdmin() {
        // Tạm thời trả về admin đầu tiên
        // Nếu dự án có nhiều admin, có thể sửa logic để random or lấy theo role
        const admin = await this.chatService.getAdminUser();
        return ResponseDto.success('Lấy admin liên hệ thành công', admin);
    }

    @Get('messages/:contactId')
    @ApiOperation({ summary: 'Lấy lịch sử tin nhắn' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMessages(
        @Req() req: UserRequest,
        @Param('contactId') contactId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    ) {
        const messages = await this.chatService.getMessages(req.user.id, contactId, page, limit);
        return ResponseDto.success('Lấy lịch sử tin nhắn thành công', messages);
    }
}
