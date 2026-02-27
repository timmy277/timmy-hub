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
import { UserRole } from '@prisma/client';
import type { UserRequest } from '../auth/interfaces/auth.interface';
import { PromotionCampaignsService } from './promotion-campaigns.service';
import { CreatePromotionCampaignDto } from './dto/create-campaign.dto';
import { UpdatePromotionCampaignDto } from './dto/update-campaign.dto';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Promotion Campaigns')
@Controller('promotion-campaigns')
export class PromotionCampaignsController {
    constructor(private readonly campaignsService: PromotionCampaignsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Tạo campaign (Seller: shop mình; Admin: PLATFORM hoặc SELLER)',
    })
    async create(@Body() dto: CreatePromotionCampaignDto, @Req() req: UserRequest) {
        const campaign = await this.campaignsService.create(req.user.id, dto, req.user.role);
        return ResponseDto.success('Tạo chương trình khuyến mãi thành công', campaign);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiQuery({ name: 'ownerType', required: false })
    @ApiQuery({ name: 'ownerId', required: false })
    @ApiOperation({
        summary: 'Danh sách campaign (Seller: của shop; Admin: tất cả hoặc lọc)',
    })
    async findAll(
        @Req() req: UserRequest,
        @Query('ownerType') ownerType?: string,
        @Query('ownerId') ownerId?: string,
    ) {
        const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;
        const list = isAdmin
            ? await this.campaignsService.findAllAdmin(ownerType, ownerId)
            : await this.campaignsService.findAllBySeller(req.user.id);
        return ResponseDto.success('Lấy danh sách chương trình thành công', list);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chi tiết campaign' })
    async findOne(@Param('id') id: string, @Req() req: UserRequest) {
        const campaign = await this.campaignsService.findOne(id, req.user.id, req.user.role);
        return ResponseDto.success('Lấy chi tiết chương trình thành công', campaign);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật campaign (Seller: shop mình; Admin: bất kỳ)' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePromotionCampaignDto,
        @Req() req: UserRequest,
    ) {
        const campaign = await this.campaignsService.update(id, req.user.id, dto, req.user.role);
        return ResponseDto.success('Cập nhật chương trình thành công', campaign);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa campaign (Seller: shop mình; Admin: bất kỳ)' })
    async remove(@Param('id') id: string, @Req() req: UserRequest) {
        await this.campaignsService.remove(id, req.user.id, req.user.role);
        return ResponseDto.success('Đã xóa chương trình khuyến mãi');
    }
}
