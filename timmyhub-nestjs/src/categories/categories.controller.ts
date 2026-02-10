import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('category:create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo danh mục mới (Admin mới có quyền)' })
    async create(@Body() dto: CreateCategoryDto) {
        const category = await this.categoriesService.create(dto);
        return ResponseDto.success('Tạo danh mục thành công', category);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục (Public)' })
    async findAll(@Query('includeInactive') includeInactive?: string) {
        const categories = await this.categoriesService.findAll(includeInactive === 'true');
        return ResponseDto.success('Lấy danh sách danh mục thành công', categories);
    }

    @Get(':idOrSlug')
    @ApiOperation({ summary: 'Lấy chi tiết danh mục theo ID hoặc Slug' })
    async findOne(@Param('idOrSlug') idOrSlug: string) {
        const category = await this.categoriesService.findOne(idOrSlug);
        return ResponseDto.success('Lấy chi tiết danh mục thành công', category);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('category:update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật danh mục' })
    async update(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
        const category = await this.categoriesService.update(id, dto);
        return ResponseDto.success('Cập nhật danh mục thành công', category);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('category:delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa danh mục' })
    async remove(@Param('id') id: string) {
        await this.categoriesService.remove(id);
        return ResponseDto.success('Xóa danh mục thành công');
    }
}
