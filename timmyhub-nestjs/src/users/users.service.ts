import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('Email đã tồn tại');
        }

        if (dto.phoneNumber) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: dto.phoneNumber },
            });
            if (existingPhone) {
                throw new BadRequestException('Số điện thoại đã tồn tại');
            }
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const role = dto.role as UserRole;

        // Xác định logic cho role: nếu là role trong enum thì gán vào trường role,
        // nếu không (là role động mới) thì để mặc định CUSTOMER hoặc ADMIN tùy map
        const finalEnumRole = Object.values(UserRole).includes(role) ? role : UserRole.CUSTOMER;

        return this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash: hashedPassword,
                role: finalEnumRole,
                phone: dto.phoneNumber || null,
                profile: {
                    create: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        displayName: `${dto.firstName} ${dto.lastName}`,
                    },
                },
                userRoles: role
                    ? {
                          create: {
                              role: {
                                  connect: { name: role },
                              },
                          },
                      }
                    : undefined,
            },
            include: {
                profile: true,
                userRoles: { include: { role: true } },
            },
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.findOne(id);

        if (dto.email && dto.email !== user.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingEmail) {
                throw new BadRequestException('Email đã tồn tại');
            }
        }

        if (dto.phoneNumber !== undefined && dto.phoneNumber !== user.phone) {
            // Treat empty string as null for phone number
            const phoneToCheck = dto.phoneNumber === '' ? null : dto.phoneNumber;

            if (phoneToCheck !== null) {
                const existingPhone = await this.prisma.user.findUnique({
                    where: { phone: phoneToCheck },
                });
                if (existingPhone) {
                    throw new BadRequestException('Số điện thoại đã tồn tại');
                }
            }
        }

        let hashedPassword: string | undefined = undefined;
        if (dto.password) {
            hashedPassword = await bcrypt.hash(dto.password, 12);
        }

        const updateData: Prisma.UserUpdateInput = {};
        if (dto.email !== undefined) updateData.email = dto.email;
        if (hashedPassword !== undefined) updateData.passwordHash = hashedPassword;

        if (dto.role !== undefined) {
            const role = dto.role as UserRole;
            const finalEnumRole = Object.values(UserRole).includes(role) ? role : UserRole.CUSTOMER;
            updateData.role = finalEnumRole;

            // Sync userRoles relationship
            updateData.userRoles = {
                deleteMany: {},
                create: {
                    role: {
                        connect: { name: role },
                    },
                },
            };
        }

        if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

        if (dto.phoneNumber !== undefined) {
            updateData.phone = dto.phoneNumber === '' ? null : dto.phoneNumber;
        }

        // Prepare profile update
        const profileUpdate: Prisma.ProfileUpdateInput = {};
        if (dto.firstName) profileUpdate.firstName = dto.firstName;
        if (dto.lastName) profileUpdate.lastName = dto.lastName;

        // If name changes, update displayName
        if (dto.firstName || dto.lastName) {
            const currentProfile = user.profile;
            const newFirst = dto.firstName || currentProfile?.firstName;
            const newLast = dto.lastName || currentProfile?.lastName;
            profileUpdate.displayName = `${newFirst} ${newLast}`;
        }

        const prismaUpdateData: Prisma.UserUpdateInput = { ...updateData };
        if (Object.keys(profileUpdate).length > 0) {
            prismaUpdateData.profile = { update: profileUpdate };
        }

        return this.prisma.user.update({
            where: { id },
            data: prismaUpdateData,
            include: {
                profile: true,
                userRoles: { include: { role: true } },
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

        return this.prisma.$transaction(async tx => {
            await tx.userSystemRole.deleteMany({ where: { userId } });

            const roles = await tx.systemRole.findMany({
                where: { name: { in: roleNames } },
            });

            return tx.userSystemRole.createMany({
                data: roles.map(r => ({
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
