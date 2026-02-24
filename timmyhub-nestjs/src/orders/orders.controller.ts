import { Controller, Get, Param, Post, Body, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { ResponseDto } from '../common/dto/response.dto';
import { OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Danh sách đơn hàng của tôi' })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    async findAll(@CurrentUser() user: User, @Query('status') status?: OrderStatus) {
        const orders = await this.ordersService.findAll(user.id, status);
        return ResponseDto.success('OK', orders);
    }

    @Post('from-cart')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo đơn hàng từ giỏ hàng' })
    async createFromCart(@CurrentUser() user: User, @Body() dto: CreateOrderFromCartDto) {
        const order = await this.ordersService.createFromCart(user.id, dto);
        return ResponseDto.success('Tạo đơn hàng thành công', order);
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('orders:read')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Danh sách tất cả đơn hàng' })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    async findAllAdmin(@Query('status') status?: OrderStatus) {
        const orders = await this.ordersService.findAllAdmin(status);
        return ResponseDto.success('OK', orders);
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('orders:read')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Chi tiết đơn hàng' })
    async findOneAdmin(@Param('id') id: string) {
        const order = await this.ordersService.findOneAdmin(id);
        return ResponseDto.success('OK', order);
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('orders:process')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Cập nhật trạng thái đơn hàng' })
    async updateStatusAdmin(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        const order = await this.ordersService.updateStatus(id, dto.status);
        return ResponseDto.success('Cập nhật trạng thái thành công', order);
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
