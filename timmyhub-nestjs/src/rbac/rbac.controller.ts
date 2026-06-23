import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Put,
    UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { AuditAction } from '../common/decorators/audit-action.decorator';

@ApiTags('RBAC (Roles & Permissions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditLogInterceptor)
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
    @AuditAction('CREATE_ROLE')
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
    @AuditAction('ASSIGN_PERMISSIONS_TO_ROLE')
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
    @AuditAction('DELETE_ROLE')
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

    @Get('permissions/:id')
    @Permissions('rbac:permissions:read')
    @ApiOperation({ summary: 'Lấy chi tiết một quyền' })
    async getPermission(@Param('id') id: string) {
        const permission = await this.rbacService.findOnePermission(id);
        return ResponseDto.success('Lấy chi tiết quyền thành công', permission);
    }

    @Post('permissions')
    @Permissions('rbac:permissions:create')
    @ApiOperation({ summary: 'Tạo quyền mới' })
    @AuditAction('CREATE_PERMISSION')
    async createPermission(@Body() dto: CreatePermissionDto) {
        const permission = await this.rbacService.createPermission(dto);
        return ResponseDto.success('Tạo quyền thành công', permission);
    }

    @Put('permissions/:id')
    @Permissions('rbac:permissions:update')
    @ApiOperation({ summary: 'Cập nhật thông tin quyền' })
    @AuditAction('UPDATE_PERMISSION')
    async updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
        const permission = await this.rbacService.updatePermission(id, dto);
        return ResponseDto.success('Cập nhật quyền thành công', permission);
    }

    @Delete('permissions/:id')
    @Permissions('rbac:permissions:delete')
    @ApiOperation({ summary: 'Xóa quyền' })
    @AuditAction('DELETE_PERMISSION')
    async deletePermission(@Param('id') id: string) {
        await this.rbacService.deletePermission(id);
        return ResponseDto.success('Xóa quyền thành công');
    }
}
