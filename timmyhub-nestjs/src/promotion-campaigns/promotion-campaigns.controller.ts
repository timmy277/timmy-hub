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
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AddProductsToCampaignDto } from './dto/add-products.dto';
import {
    BulkAddProductsToCampaignDto,
    UpdateCampaignProductDto,
} from './dto/bulk-add-products.dto';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Promotion Campaigns')
@Controller('promotion-campaigns')
export class PromotionCampaignsController {
    constructor(private readonly campaignsService: PromotionCampaignsService) {}

    /**
     * Public API - Lấy danh sách campaigns đang hoạt động (dùng cho homepage)
     */
    @Get('active')
    @ApiOperation({ summary: 'Lấy danh sách campaigns đang hoạt động (public)' })
    async findActive() {
        const campaigns = await this.campaignsService.findActiveCampaigns();
        return ResponseDto.success('Lấy danh sách chiến dịch thành công', campaigns);
    }

    /**
     * Public API - Lấy chi tiết campaign đang hoạt động
     */
    @Get('active/:id')
    @ApiOperation({ summary: 'Lấy chi tiết campaign đang hoạt động (public)' })
    async findActiveById(@Param('id') id: string) {
        const campaign = await this.campaignsService.findActiveById(id);
        return ResponseDto.success('Lấy chi tiết chiến dịch thành công', campaign);
    }

    /**
     * Public API - Lấy sản phẩm trong campaign
     */
    @Get(':id/products')
    @ApiOperation({ summary: 'Lấy sản phẩm trong campaign (public)' })
    async getCampaignProducts(@Param('id') id: string) {
        const products = await this.campaignsService.getCampaignProducts(id);
        return ResponseDto.success('Lấy sản phẩm trong chiến dịch thành công', products);
    }

    /**
     * Public API - Lấy giá campaign của sản phẩm
     */
    @Get('product/:productId/price')
    @ApiOperation({ summary: 'Lấy giá campaign của sản phẩm (public)' })
    async getProductCampaignPrice(@Param('productId') productId: string) {
        const result = await this.campaignsService.getProductCampaignPrice(productId);
        return ResponseDto.success('Lấy giá campaign thành công', result);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Tạo campaign (Seller: shop mình; Admin: PLATFORM hoặc SELLER)',
    })
    async create(@Body() dto: CreateCampaignDto, @Req() req: UserRequest) {
        const campaign = await this.campaignsService.create(
            req.user.id,
            dto as any,
            req.user.roles,
        );
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
        const isAdmin =
            req.user.roles.includes(UserRole.ADMIN) ||
            req.user.roles.includes(UserRole.SUPER_ADMIN);
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
        const campaign = await this.campaignsService.findOne(id, req.user.id, req.user.roles);
        return ResponseDto.success('Lấy chi tiết chương trình thành công', campaign);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật campaign (Seller: shop mình; Admin: bất kỳ)' })
    async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @Req() req: UserRequest) {
        const campaign = await this.campaignsService.update(
            id,
            req.user.id,
            dto as any,
            req.user.roles,
        );
        return ResponseDto.success('Cập nhật chương trình thành công', campaign);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa campaign (Seller: shop mình; Admin: bất kỳ)' })
    async remove(@Param('id') id: string, @Req() req: UserRequest) {
        await this.campaignsService.remove(id, req.user.id, req.user.roles);
        return ResponseDto.success('Đã xóa chương trình khuyến mãi');
    }

    @Post(':id/products')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm sản phẩm vào campaign' })
    async addProducts(
        @Param('id') id: string,
        @Body() dto: AddProductsToCampaignDto,
        @Req() req: UserRequest,
    ) {
        const result = await this.campaignsService.addProducts(
            id,
            req.user.id,
            dto as any,
            req.user.roles,
        );
        return ResponseDto.success(result.message);
    }

    @Delete(':id/products')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa sản phẩm khỏi campaign' })
    async removeProducts(
        @Param('id') id: string,
        @Query('productIds') productIds: string,
        @Req() req: UserRequest,
    ) {
        const ids = productIds.split(',');
        const result = await this.campaignsService.removeProducts(
            id,
            ids,
            req.user.id,
            req.user.roles,
        );
        return ResponseDto.success(result.message);
    }

    /**
     * Thêm nhiều sản phẩm vào campaign với giá riêng cho từng sản phẩm
     */
    @Post(':id/products/bulk')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm nhiều sản phẩm vào campaign với giá riêng' })
    async bulkAddProducts(
        @Param('id') id: string,
        @Body() dto: BulkAddProductsToCampaignDto,
        @Req() req: UserRequest,
    ) {
        const result = await this.campaignsService.bulkAddProducts(
            id,
            req.user.id,
            dto as any,
            req.user.roles,
        );
        return ResponseDto.success(result.message);
    }

    /**
     * Cập nhật giá sản phẩm trong campaign
     */
    @Patch(':id/products/:productId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật giá sản phẩm trong campaign' })
    async updateProductPrice(
        @Param('id') id: string,
        @Param('productId') productId: string,
        @Body() dto: UpdateCampaignProductDto,
        @Req() req: UserRequest,
    ) {
        const result = await this.campaignsService.updateProductPrice(
            id,
            productId,
            req.user.id,
            dto as any,
            req.user.roles,
        );
        return ResponseDto.success(result.message);
    }
}
