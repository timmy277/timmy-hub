import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreatePromotionCampaignDto } from './dto/create-campaign.dto';
import { UpdatePromotionCampaignDto } from './dto/update-campaign.dto';

const OWNER_TYPE_SELLER = 'SELLER';

@Injectable()
export class PromotionCampaignsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, dto: CreatePromotionCampaignDto, userRole?: string) {
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        const ownerType = isAdmin && dto.ownerType ? dto.ownerType : OWNER_TYPE_SELLER;
        const ownerId = isAdmin && dto.ownerId !== undefined ? dto.ownerId : userId;
        if (ownerType === OWNER_TYPE_SELLER && !ownerId) {
            throw new BadRequestException('ownerId bắt buộc khi ownerType=SELLER');
        }
        const start = dto.startDate ? new Date(dto.startDate) : new Date();
        const end = dto.endDate
            ? new Date(dto.endDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        if (end <= start) {
            throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
        }
        return this.prisma.promotionCampaign.create({
            data: {
                name: dto.name,
                description: dto.description ?? undefined,
                type: dto.type,
                ownerType,
                ownerId: ownerId ?? undefined,
                startDate: start,
                endDate: end,
                isActive: dto.isActive ?? true,
                createdBy: userId,
            },
        });
    }

    async findAllBySeller(sellerId: string) {
        return this.prisma.promotionCampaign.findMany({
            where: { ownerType: OWNER_TYPE_SELLER, ownerId: sellerId },
            orderBy: { createdAt: 'desc' },
            include: {
                vouchers: {
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        usedCount: true,
                        isActive: true,
                    },
                },
            },
        });
    }

    async findAllAdmin(ownerType?: string, ownerId?: string) {
        const where: { ownerType?: string; ownerId?: string | null } = {};
        if (ownerType) where.ownerType = ownerType;
        if (ownerId !== undefined) where.ownerId = ownerId;
        return this.prisma.promotionCampaign.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                vouchers: {
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        usedCount: true,
                        isActive: true,
                    },
                },
            },
        });
    }

    async findOne(id: string, userId: string, userRole?: string) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id },
            include: { vouchers: true },
        });
        if (!campaign) {
            throw new NotFoundException('Chương trình khuyến mãi không tồn tại');
        }
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        if (!isAdmin && campaign.ownerType === OWNER_TYPE_SELLER && campaign.ownerId !== userId) {
            throw new ForbiddenException('Bạn không có quyền xem chương trình này');
        }
        return campaign;
    }

    async update(id: string, userId: string, dto: UpdatePromotionCampaignDto, userRole?: string) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            throw new NotFoundException('Chương trình khuyến mãi không tồn tại');
        }
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException('Bạn chỉ có thể sửa campaign của shop mình');
        }
        const data: Prisma.PromotionCampaignUpdateInput = { ...dto };
        if (dto.startDate) data.startDate = new Date(dto.startDate);
        if (dto.endDate) data.endDate = new Date(dto.endDate);
        return this.prisma.promotionCampaign.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, userId: string, userRole?: string) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            throw new NotFoundException('Chương trình khuyến mãi không tồn tại');
        }
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException('Bạn chỉ có thể xóa campaign của shop mình');
        }
        await this.prisma.promotionCampaign.delete({ where: { id } });
        return { message: 'Đã xóa chương trình khuyến mãi' };
    }
}
