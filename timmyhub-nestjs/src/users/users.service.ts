import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }


    async create(dto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('Email đã tồn tại');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        return this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash: hashedPassword,
                role: dto.role as any || 'CUSTOMER',
                profile: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        displayName: `${dto.firstName} ${dto.lastName}`,
                    },
                },
            },
            include: {
                profile: true,
            },
        });
    }

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
