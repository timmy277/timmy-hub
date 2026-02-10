import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('RBAC (Roles & Permissions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rbac')
export class RbacController {
    constructor(private readonly rbacService: RbacService) {}

    // ==================== ROLES ====================

    @Get('roles')
    @Permissions('rbac:roles:read')
    @ApiOperation({ summary: 'Lấy danh sách tất cả vai trò' })
    async getRoles() {
        const roles = await this.rbacService.findAllRoles();
        return ResponseDto.success('Lấy danh sách vai trò thành công', roles);
    }

    @Post('roles')
    @Permissions('rbac:roles:create')
    @ApiOperation({ summary: 'Tạo vai trò mới' })
    async createRole(@Body() dto: CreateRoleDto) {
        const role = await this.rbacService.createRole(dto);
        return ResponseDto.success('Tạo vai trò thành công', role);
    }

    @Get('roles/:id')
    @Permissions('rbac:roles:read')
    @ApiOperation({ summary: 'Lấy chi tiết một vai trò' })
    async getRole(@Param('id') id: string) {
        const role = await this.rbacService.findOneRole(id);
        return ResponseDto.success('Lấy chi tiết vai trò thành công', role);
    }

    @Put('roles/:id/permissions')
    @Permissions('rbac:roles:update')
    @ApiOperation({ summary: 'Gán danh sách quyền cho vai trò' })
    async assignPermissions(
        @Param('id') id: string,
        @Body('permissionNames') permissionNames: string[],
    ) {
        await this.rbacService.assignPermissionsToRole(id, permissionNames);
        return ResponseDto.success('Cập nhật quyền cho vai trò thành công');
    }

    @Delete('roles/:id')
    @Permissions('rbac:roles:delete')
    @ApiOperation({ summary: 'Xóa vai trò' })
    async deleteRole(@Param('id') id: string) {
        await this.rbacService.deleteRole(id);
        return ResponseDto.success('Xóa vai trò thành công');
    }

    // ==================== PERMISSIONS ====================

    @Get('permissions')
    @Permissions('rbac:permissions:read')
    @ApiOperation({ summary: 'Lấy danh sách tất cả quyền' })
    async getPermissions() {
        const permissions = await this.rbacService.findAllPermissions();
        return ResponseDto.success('Lấy danh sách quyền thành công', permissions);
    }

    @Post('permissions')
    @Permissions('rbac:permissions:create')
    @ApiOperation({ summary: 'Tạo quyền mới' })
    async createPermission(
        @Body() data: { name: string; displayName: string; module: string; action: string },
    ) {
        const permission = await this.rbacService.createPermission(data);
        return ResponseDto.success('Tạo quyền thành công', permission);
    }
}
