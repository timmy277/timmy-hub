import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LocationService } from './location.service';
import {
    CreateProvinceDto,
    CreateDistrictDto,
    CreateWardDto,
    UpdateProvinceDto,
    UpdateDistrictDto,
    UpdateWardDto,
} from './dto/location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) {}

    // ===== Public Routes =====

    @Get('provinces')
    @ApiOperation({ summary: 'Lấy danh sách tất cả tỉnh/thành' })
    getProvinces() {
        return this.locationService.getProvinces();
    }

    @Get('provinces/:provinceCode/districts')
    @ApiOperation({ summary: 'Lấy danh sách quận/huyện theo tỉnh' })
    getDistrictsByProvince(@Param('provinceCode') provinceCode: string) {
        return this.locationService.getDistrictsByProvince(provinceCode);
    }

    @Get('districts/:districtCode/wards')
    @ApiOperation({ summary: 'Lấy danh sách phường/xã theo quận' })
    getWardsByDistrict(@Param('districtCode') districtCode: string) {
        return this.locationService.getWardsByDistrict(districtCode);
    }

    // ===== Admin Routes =====

    @Get('provinces/admin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả tỉnh/thành' })
    getAllProvinces() {
        return this.locationService.getProvinces();
    }

    @Get('districts/admin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả quận/huyện' })
    getAllDistricts() {
        return this.locationService.getAllDistricts();
    }

    @Get('wards/admin')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả phường/xã' })
    getAllWards() {
        return this.locationService.getAllWards();
    }

    // Province CRUD

    @Post('provinces')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Tạo tỉnh/thành' })
    createProvince(@Body() dto: CreateProvinceDto) {
        return this.locationService.createProvince(dto);
    }

    @Get('provinces/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Lấy chi tiết tỉnh/thành' })
    getProvince(@Param('code') code: string) {
        return this.locationService.getProvinceByCode(code);
    }

    @Patch('provinces/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Cập nhật tỉnh/thành' })
    updateProvince(@Param('code') code: string, @Body() dto: UpdateProvinceDto) {
        return this.locationService.updateProvince(code, dto);
    }

    @Delete('provinces/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Xóa tỉnh/thành' })
    deleteProvince(@Param('code') code: string) {
        return this.locationService.deleteProvince(code);
    }

    // District CRUD

    @Post('districts')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Tạo quận/huyện' })
    createDistrict(@Body() dto: CreateDistrictDto) {
        return this.locationService.createDistrict(dto);
    }

    @Get('districts/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Lấy chi tiết quận/huyện' })
    getDistrict(@Param('code') code: string) {
        return this.locationService.getDistrictByCode(code);
    }

    @Patch('districts/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Cập nhật quận/huyện' })
    updateDistrict(@Param('code') code: string, @Body() dto: UpdateDistrictDto) {
        return this.locationService.updateDistrict(code, dto);
    }

    @Delete('districts/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Xóa quận/huyện' })
    deleteDistrict(@Param('code') code: string) {
        return this.locationService.deleteDistrict(code);
    }

    // Ward CRUD

    @Post('wards')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Tạo phường/xã' })
    createWard(@Body() dto: CreateWardDto) {
        return this.locationService.createWard(dto);
    }

    @Get('wards/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Lấy chi tiết phường/xã' })
    getWard(@Param('code') code: string) {
        return this.locationService.getWardByCode(code);
    }

    @Patch('wards/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Cập nhật phường/xã' })
    updateWard(@Param('code') code: string, @Body() dto: UpdateWardDto) {
        return this.locationService.updateWard(code, dto);
    }

    @Delete('wards/:code')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[Admin] Xóa phường/xã' })
    deleteWard(@Param('code') code: string) {
        return this.locationService.deleteWard(code);
    }
}
