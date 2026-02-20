import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post('from-cart')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo đơn hàng từ giỏ hàng' })
    async createFromCart(@CurrentUser() user: User, @Body() dto: CreateOrderFromCartDto) {
        const order = await this.ordersService.createFromCart(user.id, dto);
        return ResponseDto.success('Tạo đơn hàng thành công', order);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chi tiết đơn hàng' })
    async findOne(@CurrentUser() user: User, @Param('id') id: string) {
        const order = await this.ordersService.findOne(id, user.id);
        return ResponseDto.success('OK', order);
    }
}
