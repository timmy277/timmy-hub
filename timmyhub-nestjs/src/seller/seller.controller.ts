import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { UserRequest } from '../auth/interfaces/auth.interface';
import { SellerService } from './seller.service';
import { RegisterSellerDto } from './dto/register-seller.dto';
import {
    type CheckProfileResponseDto,
    toCheckProfileResponse,
} from './dto/check-profile-response.dto';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Seller')
@Controller('seller')
export class SellerController {
    constructor(private readonly sellerService: SellerService) {}

    @Post('register')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Đăng ký trở thành seller (trạng thái PENDING, admin duyệt mới thành seller)',
    })
    async register(@Body() dto: RegisterSellerDto, @Req() req: UserRequest) {
        const profile = await this.sellerService.register(req.user.id, dto);
        return ResponseDto.success(
            'Đăng ký gian hàng thành công. Vui lòng chờ admin duyệt.',
            profile,
        );
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy thông tin gian hàng của tôi (chỉ khi đã được duyệt)' })
    async getMyProfile(@Req() req: UserRequest) {
        const profile = await this.sellerService.getMyProfile(req.user.id);
        return ResponseDto.success('Lấy thông tin gian hàng thành công', profile);
    }

    @Get('profile/check')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Kiểm tra đã có gian hàng chưa và trạng thái duyệt (PENDING/APPROVED/REJECTED)',
    })
    async checkProfile(@Req() req: UserRequest) {
        const profile = await this.sellerService.getMyProfileOrNull(req.user.id);
        const data: CheckProfileResponseDto = toCheckProfileResponse(profile);
        return ResponseDto.success<CheckProfileResponseDto>('OK', data);
    }

    // ---------- Admin: duyệt đơn đăng ký seller ----------
    @Get('admin/applications')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Danh sách đơn đăng ký seller chờ duyệt' })
    async listPendingApplications() {
        const list = await this.sellerService.listPending();
        return ResponseDto.success('OK', list);
    }

    @Patch('admin/applications/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Duyệt đơn đăng ký seller' })
    async approveApplication(@Param('id') id: string) {
        const profile = await this.sellerService.approve(id);
        return ResponseDto.success('Đã duyệt seller', profile);
    }

    @Patch('admin/applications/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Từ chối đơn đăng ký seller' })
    async rejectApplication(@Param('id') id: string) {
        const profile = await this.sellerService.reject(id);
        return ResponseDto.success('Đã từ chối đơn', profile);
    }
}
