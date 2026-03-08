import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wishlist')
@Controller('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistsController {
    constructor(private readonly wishlistsService: WishlistsService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách yêu thích của tôI' })
    getMyWishlist(@Request() req: any) {
        return this.wishlistsService.getMyWishlist(req.user.id as string);
    }

    @Post(':productId/toggle')
    @ApiOperation({ summary: 'Thêm hoặc xóa khỏi yêu thích' })
    toggleWishlist(@Request() req: any, @Param('productId') productId: string) {
        return this.wishlistsService.toggleWishlist(req.user.id as string, productId);
    }

    @Get(':productId/check')
    @ApiOperation({ summary: 'Kiểm tra xem SP đã nằm trong wishlist chưa' })
    checkWishlist(@Request() req: any, @Param('productId') productId: string) {
        return this.wishlistsService.checkWishlist(req.user.id as string, productId);
    }
}
