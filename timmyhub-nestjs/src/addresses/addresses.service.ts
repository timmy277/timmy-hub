import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from '@timmyhub/shared';

@Injectable()
export class AddressesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllForUser(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
        });
    }

    async create(userId: string, dto: CreateAddressDto) {
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return this.prisma.address.create({
            data: {
                userId,
                label: dto.label,
                fullName: dto.fullName,
                phone: dto.phone,
                addressLine1: dto.addressLine1,
                addressLine2: dto.addressLine2,
                provinceCode: dto.provinceCode,
                districtCode: dto.districtCode,
                wardCode: dto.wardCode,
                provinceName: dto.provinceName,
                districtName: dto.districtName,
                wardName: dto.wardName,
                isDefault: dto.isDefault ?? false,
            },
        });
    }

    async update(userId: string, id: string, dto: UpdateAddressDto) {
        const existing = await this.prisma.address.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new NotFoundException('addresses.notFound');
        }
        if (dto.isDefault === true) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return this.prisma.address.update({
            where: { id },
            data: {
                ...(dto.label !== undefined && { label: dto.label }),
                ...(dto.fullName !== undefined && { fullName: dto.fullName }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.addressLine1 !== undefined && { addressLine1: dto.addressLine1 }),
                ...(dto.addressLine2 !== undefined && { addressLine2: dto.addressLine2 }),
                ...(dto.wardCode !== undefined && { wardCode: dto.wardCode }),
                ...(dto.districtCode !== undefined && { districtCode: dto.districtCode }),
                ...(dto.provinceCode !== undefined && { provinceCode: dto.provinceCode }),
                ...(dto.wardName !== undefined && { wardName: dto.wardName }),
                ...(dto.districtName !== undefined && { districtName: dto.districtName }),
                ...(dto.provinceName !== undefined && { provinceName: dto.provinceName }),
                ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
            },
        });
    }

    async remove(userId: string, id: string) {
        const existing = await this.prisma.address.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new NotFoundException('addresses.notFound');
        }
        await this.prisma.address.delete({ where: { id } });
    }

    async setDefault(userId: string, id: string) {
        const existing = await this.prisma.address.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new NotFoundException('addresses.notFound');
        }
        await this.prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
        return this.prisma.address.update({
            where: { id },
            data: { isDefault: true },
        });
    }

    /** Dùng khi tạo đơn — xác minh địa chỉ thuộc user */
    async findOneForUserOrThrow(userId: string, addressId: string) {
        const addr = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!addr) {
            throw new NotFoundException('addresses.notFound');
        }
        return addr;
    }
}
