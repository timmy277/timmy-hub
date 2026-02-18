import { Injectable, NotFoundException, ConflictException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/create-permission.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import { UserWithPermissions } from '../casl/casl-ability.factory';

@Injectable()
export class RbacService {
    private readonly logger = new Logger(RbacService.name);

    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
        const cacheKey = `user_permissions_full:${userId}`;
        const cached = await this.cacheManager.get<UserWithPermissions>(cacheKey);
        if (cached) {
            return cached;
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
                userPermissions: {
                    include: {
                        permission: true,
                    },
                },
                profile: true, // Include profile explicitly as it is used in auth.service
            },
        });

        if (user) {
            await this.cacheManager.set(cacheKey, user, 600000); // 10 minutes
        }

        return user as UserWithPermissions;
    }

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
            const result = await tx.rolePermission.createMany({
                data: permissions.map(p => ({
                    roleId,
                    permissionId: p.id,
                })),
            });

            // Tìm tất cả user đang có role này để xóa cache
            const usersWithRole = await tx.userSystemRole.findMany({
                where: { roleId },
                select: { userId: true },
            });

            for (const u of usersWithRole) {
                await this.cacheManager.del(`user_permissions:${u.userId}`);
                await this.cacheManager.del(`user_permissions_full:${u.userId}`);
            }

            return result;
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
