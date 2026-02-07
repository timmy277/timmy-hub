import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ResourceStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(sellerId: string, dto: CreateProductDto) {
        return this.prisma.product.create({
            data: {
                ...dto,
                sellerId,
                status: ResourceStatus.PENDING,
            },
        });
    }

    async findAll(includePending = false) {
        if (includePending) {
            return this.prisma.product.findMany({
                orderBy: { createdAt: 'desc' },
                include: { seller: { select: { email: true, profile: true } } },
            });
        }
        return this.prisma.product.findMany({
            where: { status: ResourceStatus.APPROVED },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { seller: { select: { email: true, profile: true } } },
        });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        return product;
    }

    async approve(id: string, adminId: string) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: {
                status: ResourceStatus.APPROVED,
                reviewedById: adminId,
            },
        });
    }

    async reject(id: string, adminId: string, note: string) {
        await this.findOne(id);
        return this.prisma.product.update({
            where: { id },
            data: {
                status: ResourceStatus.REJECTED,
                reviewedById: adminId,
                reviewNote: note,
            },
        });
    }
}
