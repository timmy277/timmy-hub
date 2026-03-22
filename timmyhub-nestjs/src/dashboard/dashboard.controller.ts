import { Controller, Get, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    @ApiOperation({ summary: '[Admin] Lấy toàn bộ dữ liệu dashboard' })
    @ApiQuery({
        name: 'rangeDays',
        required: false,
        type: Number,
        description: 'Số ngày thống kê (mặc định: 30)',
    })
    async getDashboard(
        @Query('rangeDays', new DefaultValuePipe(30), ParseIntPipe) rangeDays: number,
    ) {
        const data = await this.dashboardService.getDashboardData(rangeDays);
        return data;
    }

    @Get('overview')
    @ApiOperation({ summary: '[Admin] Lấy tổng quan dashboard' })
    @ApiQuery({ name: 'rangeDays', required: false, type: Number })
    async getOverview(
        @Query('rangeDays', new DefaultValuePipe(30), ParseIntPipe) rangeDays: number,
    ) {
        const data = await this.dashboardService.getOverview(rangeDays);
        return data;
    }

    @Get('revenue')
    @ApiOperation({ summary: '[Admin] Doanh thu theo ngày' })
    @ApiQuery({ name: 'days', required: false, type: Number })
    async getRevenueByDay(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
        const data = await this.dashboardService.getRevenueByDay(days);
        return data;
    }

    @Get('orders/status')
    @ApiOperation({ summary: '[Admin] Thống kê trạng thái đơn hàng' })
    async getOrderStatusBreakdown() {
        const data = await this.dashboardService.getOrderStatusBreakdown();
        return data;
    }

    @Get('products/top')
    @ApiOperation({ summary: '[Admin] Top sản phẩm bán chạy' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getTopProducts(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
        const data = await this.dashboardService.getTopProducts(limit);
        return data;
    }

    @Get('categories/top')
    @ApiOperation({ summary: '[Admin] Top danh mục' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getTopCategories(@Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number) {
        const data = await this.dashboardService.getTopCategories(limit);
        return data;
    }

    @Get('orders/recent')
    @ApiOperation({ summary: '[Admin] Đơn hàng gần đây' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecentOrders(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
        const data = await this.dashboardService.getRecentOrders(limit);
        return data;
    }

    @Get('activity')
    @ApiOperation({ summary: '[Admin] Hoạt động gần đây' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getRecentActivity(@Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number) {
        const data = await this.dashboardService.getRecentActivity(limit);
        return data;
    }
}
