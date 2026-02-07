import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            include: {
                profile: true,
                userRoles: { include: { role: true } },
            },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                userRoles: { include: { role: true } },
                userPermissions: { include: { permission: true } },
            },
        });
        if (!user) throw new NotFoundException('Không tìm thấy người dùng');
        return user;
    }

    async assignRoles(userId: string, roleNames: string[]) {
        await this.findOne(userId);

        return this.prisma.$transaction(async (tx) => {
            await tx.userSystemRole.deleteMany({ where: { userId } });

            const roles = await tx.systemRole.findMany({
                where: { name: { in: roleNames } },
            });

            return tx.userSystemRole.createMany({
                data: roles.map((r) => ({
                    userId,
                    roleId: r.id,
                })),
            });
        });
    }

    async toggleActive(id: string) {
        const user = await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
    }
}
