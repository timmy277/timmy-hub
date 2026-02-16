import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import type { UserRequest } from '../auth/interfaces/auth.interface';

@ApiTags('Products (Approval Flow Example)')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đăng bán sản phẩm mới (Mặc định sẽ ở trạng thái PENDING)' })
    async create(@Body() dto: CreateProductDto, @Req() req: UserRequest) {
        const product = await this.productsService.create(req.user.id, dto);
        return ResponseDto.success('Đăng sản phẩm thành công, vui lòng chờ duyệt', product);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách sản phẩm đã được duyệt (Public)' })
    async findAll() {
        const products = await this.productsService.findAll(false);
        return ResponseDto.success('Lấy danh sách sản phẩm thành công', products);
    }

    @Get('admin/pending')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('product:approve')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy tất cả sản phẩm (Dành cho Admin duyệt)' })
    async findAllForAdmin() {
        const products = await this.productsService.findAll(true);
        return ResponseDto.success('Lấy danh sách sản phẩm admin thành công', products);
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
}
