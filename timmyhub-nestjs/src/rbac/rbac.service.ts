import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RbacService {
    private readonly logger = new Logger(RbacService.name);

    constructor(private prisma: PrismaService) {}

    // ==================== ROLES ====================

    async findAllRoles() {
        return this.prisma.systemRole.findMany({
            include: {
                _count: {
                    select: { permissions: true, users: true },
                },
            },
        });
    }

    async findOneRole(id: string) {
        const role = await this.prisma.systemRole.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true },
                },
            },
        });
        if (!role) throw new NotFoundException('Không tìm thấy vai trò');
        return role;
    }

    async createRole(dto: CreateRoleDto) {
        this.logger.log(`Tạo vai trò mới: ${dto.name}`);
        const existing = await this.prisma.systemRole.findUnique({
            where: { name: dto.name },
        });
        if (existing) throw new ConflictException('Tên vai trò đã tồn tại');

        return this.prisma.$transaction(async tx => {
            const role = await tx.systemRole.create({
                data: {
                    name: dto.name,
                    displayName: dto.displayName,
                    description: dto.description,
                    isSystem: dto.isSystem || false,
                },
            });

            if (dto.permissionNames && dto.permissionNames.length > 0) {
                const permissions = await tx.permission.findMany({
                    where: { name: { in: dto.permissionNames } },
                });

                await tx.rolePermission.createMany({
                    data: permissions.map(p => ({
                        roleId: role.id,
                        permissionId: p.id,
                    })),
                });
            }

            return role;
        });
    }

    async deleteRole(id: string) {
        const role = await this.findOneRole(id);
        if (role.isSystem) throw new ConflictException('Không thể xóa vai trò hệ thống');
        return this.prisma.systemRole.delete({ where: { id } });
    }

    async assignPermissionsToRole(roleId: string, permissionNames: string[]) {
        await this.findOneRole(roleId);

        return this.prisma.$transaction(async tx => {
            // Xóa tất cả quyền cũ
            await tx.rolePermission.deleteMany({ where: { roleId } });

            // Tìm ID của các quyền mới
            const permissions = await tx.permission.findMany({
                where: { name: { in: permissionNames } },
            });

            // Tạo mapping mới
            return tx.rolePermission.createMany({
                data: permissions.map(p => ({
                    roleId,
                    permissionId: p.id,
                })),
            });
        });
    }

    // ==================== PERMISSIONS ====================

    async findAllPermissions() {
        return this.prisma.permission.findMany();
    }

    async findOnePermission(id: string) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
        });
        if (!permission) throw new NotFoundException('Không tìm thấy quyền');
        return permission;
    }

    async createPermission(dto: CreatePermissionDto) {
        const existing = await this.prisma.permission.findUnique({
            where: { name: dto.name },
        });
        if (existing) throw new ConflictException('Tên quyền đã tồn tại');

        return this.prisma.permission.create({ data: dto });
    }

    async updatePermission(id: string, dto: UpdatePermissionDto) {
        await this.findOnePermission(id);
        return this.prisma.permission.update({
            where: { id },
            data: dto,
        });
    }

    async deletePermission(id: string) {
        await this.findOnePermission(id);
        // Kiểm tra xem quyền có đang được sử dụng không
        const usageCount = await this.prisma.rolePermission.count({
            where: { permissionId: id },
        });
        if (usageCount > 0) {
            throw new ConflictException('Không thể xóa quyền đang được gán cho vai trò');
        }

        return this.prisma.permission.delete({ where: { id } });
    }
}
