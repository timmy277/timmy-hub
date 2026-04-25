/**
 * Search Controller
 * GET /search?q=...&category=...&minPrice=...
 * GET /search/suggest?q=...
 * POST /search/reindex (Admin only)
 */
import { Controller, Get, Post, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchProductDto, SuggestDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get()
    @Public()
    @ApiOperation({ summary: 'Full-text search sản phẩm' })
    async search(@Query() dto: SearchProductDto) {
        return this.searchService.search(dto);
    }

    @Get('suggest')
    @Public()
    @ApiOperation({ summary: 'Autocomplete gợi ý tên sản phẩm' })
    async suggest(@Query() dto: SuggestDto) {
        const suggestions = await this.searchService.suggest(dto.q ?? '');
        return { data: suggestions };
    }

    @Get('status')
    @Public()
    @ApiOperation({ summary: 'Kiểm tra trạng thái Elasticsearch' })
    status() {
        return { available: this.searchService.available };
    }

    @Post('reindex')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reindex toàn bộ sản phẩm (Admin)' })
    async reindex() {
        return this.searchService.reindexAll();
    }
}
