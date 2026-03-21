import {
    Controller,
    Get,
    Post,
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

    @Get('contacts')
    @ApiOperation({ summary: 'Lấy danh sách người dùng đã chat với mình' })
    async getContacts(@Req() req: UserRequest) {
        const contacts = await this.chatService.getContacts(req.user.id);
        return ResponseDto.success('Lấy danh sách contact thành công', contacts);
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

    @Get('unread')
    @ApiOperation({ summary: 'Lấy số tin nhắn chưa đọc theo từng contact' })
    async getUnreadCounts(@Req() req: UserRequest) {
        const unreadCounts = await this.chatService.getUnreadCounts(req.user.id);
        return ResponseDto.success('Lấy số tin nhắn chưa đọc thành công', unreadCounts);
    }

    @Get('unread/total')
    @ApiOperation({ summary: 'Lấy tổng số tin nhắn chưa đọc' })
    async getTotalUnreadCount(@Req() req: UserRequest) {
        const total = await this.chatService.getTotalUnreadCount(req.user.id);
        return ResponseDto.success('Lấy tổng số tin nhắn chưa đọc thành công', total);
    }

    @Post('read/:contactId')
    @ApiOperation({ summary: 'Đánh dấu tin nhắn từ contact là đã đọc' })
    async markAsRead(@Req() req: UserRequest, @Param('contactId') contactId: string) {
        const count = await this.chatService.markAsRead(req.user.id, contactId);
        return ResponseDto.success('Đánh dấu đã đọc thành công', { markedAsRead: count });
    }

    @Post('read-all')
    @ApiOperation({ summary: 'Đánh dấu tất cả tin nhắn là đã đọc' })
    async markAllAsRead(@Req() req: UserRequest) {
        const count = await this.chatService.markAllAsRead(req.user.id);
        return ResponseDto.success('Đánh dấu tất cả đã đọc thành công', { markedAsRead: count });
    }
}
