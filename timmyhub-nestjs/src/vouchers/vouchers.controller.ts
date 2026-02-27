import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, PaymentMethod } from '@prisma/client';
import type { UserRequest } from '../auth/interfaces/auth.interface';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
    constructor(private readonly vouchersService: VouchersService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Tạo voucher (Seller: shop mình; Admin: voucher sàn hoặc của seller)',
    })
    async create(@Body() dto: CreateVoucherDto, @Req() req: UserRequest) {
        const voucher = await this.vouchersService.create(
            req.user.id,
            dto,
            dto.campaignId,
            req.user.role,
        );
        return ResponseDto.success('Tạo voucher thành công', voucher);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiQuery({ name: 'sellerId', required: false, description: 'Admin: lọc theo seller' })
    @ApiOperation({
        summary: 'Danh sách voucher (Seller: của shop; Admin: tất cả hoặc theo sellerId)',
    })
    async findAll(@Req() req: UserRequest, @Query('sellerId') sellerId?: string) {
        const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;
        const list = isAdmin
            ? await this.vouchersService.findAllAdmin(sellerId)
            : await this.vouchersService.findAllBySeller(req.user.id);
        return ResponseDto.success('Lấy danh sách voucher thành công', list);
    }

    @Post('validate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Khách: Kiểm tra mã voucher (theo giỏ hàng + PT thanh toán)' })
    async validate(@Body() dto: ValidateVoucherDto, @CurrentUser() user: { id: string }) {
        const paymentMethod = dto.paymentMethod ?? PaymentMethod.VNPAY;
        const result = await this.vouchersService.validate(dto.code, user.id, paymentMethod);
        return ResponseDto.success(
            result.valid ? 'Voucher hợp lệ' : (result.message ?? 'Voucher không hợp lệ'),
            result,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chi tiết voucher (seller owner hoặc admin)' })
    async findOne(@Param('id') id: string, @Req() req: UserRequest) {
        const voucher = await this.vouchersService.findOne(id, req.user.id, req.user.role);
        return ResponseDto.success('Lấy chi tiết voucher thành công', voucher);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật voucher (Seller: shop mình; Admin: bất kỳ)' })
    async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto, @Req() req: UserRequest) {
        const voucher = await this.vouchersService.update(id, req.user.id, dto, req.user.role);
        return ResponseDto.success('Cập nhật voucher thành công', voucher);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa voucher (Seller: shop mình; Admin: bất kỳ)' })
    async remove(@Param('id') id: string, @Req() req: UserRequest) {
        await this.vouchersService.remove(id, req.user.id, req.user.role);
        return ResponseDto.success('Đã xóa voucher');
    }
}
