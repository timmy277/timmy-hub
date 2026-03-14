import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/action.enum';
import { AppAbility } from '../casl/casl-ability.factory';
import { ResponseDto } from '../common/dto/response.dto';
import type { UserRequest } from '../auth/interfaces/auth.interface';

@ApiTags('Products (Approval Flow Example)')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Seller đăng sản phẩm (PENDING, chờ admin duyệt)' })
    async create(@Body() dto: CreateProductDto, @Req() req: UserRequest) {
        const product = await this.productsService.create(req.user.id, dto);
        return ResponseDto.success('Đăng sản phẩm thành công, vui lòng chờ admin duyệt', product);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách sản phẩm đã duyệt (Public)' })
    async findAll() {
        const products = await this.productsService.findAll();
        return ResponseDto.success('Lấy danh sách sản phẩm thành công', products);
    }

    @Get('filter')
    @ApiOperation({ summary: 'Lấy danh sách sản phẩm với bộ lọc (Public)' })
    async findWithFilters(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('categoryId') categoryId?: string,
        @Query('brandId') brandId?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('minRating') minRating?: string,
        @Query('sellerId') sellerId?: string,
        @Query('sort') sort?: 'newest' | 'best_selling' | 'price_asc' | 'price_desc' | 'rating',
    ) {
        const result = await this.productsService.findWithFilters({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            categoryId,
            brandId,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            minRating: minRating ? parseFloat(minRating) : undefined,
            sellerId,
            sort,
        });
        return ResponseDto.success('Lấy danh sách sản phẩm thành công', result);
    }

    @Get('seller/mine')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Seller: sản phẩm của tôi (mọi trạng thái)' })
    async findMyProducts(@Req() req: UserRequest) {
        const products = await this.productsService.findAllBySeller(req.user.id);
        return ResponseDto.success('Lấy danh sách sản phẩm thành công', products);
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: tất cả sản phẩm (mọi trạng thái)' })
    async findAllAdmin() {
        const products = await this.productsService.findAllAdmin();
        return ResponseDto.success('Lấy danh sách sản phẩm thành công', products);
    }

    @Get('admin/pending')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Admin: sản phẩm chờ duyệt (PENDING)' })
    async findAllPending() {
        const products = await this.productsService.findAllPending();
        return ResponseDto.success('Lấy danh sách sản phẩm chờ duyệt thành công', products);
    }

    @Patch(':id/approve')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Duyệt sản phẩm (Chấp nhận)' })
    async approve(@Param('id') id: string, @Req() req: UserRequest) {
        await this.productsService.approve(id, req.user.id);
        return ResponseDto.success('Đã duyệt sản phẩm thành công');
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Lấy chi tiết sản phẩm qua slug (Public)' })
    async findBySlug(@Param('slug') slug: string) {
        const product = await this.productsService.findBySlug(slug);
        return ResponseDto.success('Lấy chi tiết sản phẩm thành công', product);
    }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Từ chối sản phẩm (Hủy)' })
    async reject(@Param('id') id: string, @Body('note') note: string, @Req() req: UserRequest) {
        await this.productsService.reject(id, req.user.id, note);
        return ResponseDto.success('Đã từ chối sản phẩm');
    }

    // ==================== CASL POLICIES EXAMPLES ====================
    // Sử dụng @CheckPolicies cho attribute-based access control (ABAC)

    @Patch(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, 'Product'))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Cập nhật sản phẩm (CASL Policy)',
        description:
            'Sử dụng CASL Policies: Chỉ SELLER owner hoặc ADMIN mới được update. Defined in CaslAbilityFactory.',
    })
    async update(
        @Param('id') id: string,
        @Body() dto: Partial<CreateProductDto>,
        @Req() req: UserRequest,
    ) {
        // Service sẽ check ownership
        const product = await this.productsService.update(id, req.user.id, dto);
        return ResponseDto.success('Cập nhật sản phẩm thành công', product);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, 'Product'))
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Xóa sản phẩm (CASL Policy với điều kiện)',
        description:
            'Sử dụng CASL Policies: Chỉ được xóa nếu soldCount = 0. Conditional rule defined in CaslAbilityFactory.',
    })
    async delete(@Param('id') id: string, @Req() req: UserRequest) {
        // Service sẽ check soldCount > 0 hoặc không
        await this.productsService.delete(id, req.user.id);
        return ResponseDto.success('Xóa sản phẩm thành công');
    }
}
