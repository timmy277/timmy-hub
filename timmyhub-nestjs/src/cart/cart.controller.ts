import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { BulkAddToCartDto } from './dto/bulk-add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    async getCart(@CurrentUser() user: User) {
        const cart = await this.cartService.getCart(user.id);
        return {
            success: true,
            data: cart,
        };
    }

    @Post('items')
    async addToCart(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
        const cart = await this.cartService.addToCart(user.id, dto);
        return {
            success: true,
            message: `Đã thêm ${dto.quantity} sản phẩm vào giỏ hàng`,
            data: cart,
        };
    }

    @Patch('items/:itemId')
    async updateQuantity(
        @CurrentUser() user: User,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        const cart = await this.cartService.updateQuantity(user.id, itemId, dto.quantity);
        return {
            success: true,
            message: dto.quantity === 0 ? 'Đã xóa sản phẩm' : 'Đã cập nhật số lượng',
            data: cart,
        };
    }

    @Delete('items/:itemId')
    async removeItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
        const cart = await this.cartService.removeItem(user.id, itemId);
        return {
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
            data: cart,
        };
    }

    @Delete()
    async clearCart(@CurrentUser() user: User) {
        const result = await this.cartService.clearCart(user.id);
        return {
            success: true,
            message: result.message,
        };
    }

    @Post('items/bulk')
    async bulkAddToCart(@CurrentUser() user: User, @Body() dto: BulkAddToCartDto) {
        const result = await this.cartService.bulkAddToCart(user.id, dto);
        return {
            success: true,
            message: `Đã thêm ${result.summary.success}/${result.summary.total} sản phẩm`,
            data: result,
        };
    }

    @Post('validate')
    async validateCart(@CurrentUser() user: User) {
        const result = await this.cartService.validateCart(user.id);
        return {
            success: result.valid,
            message: result.valid ? 'Giỏ hàng hợp lệ' : 'Giỏ hàng có vấn đề',
            data: result,
        };
    }
}
