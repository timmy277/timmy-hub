import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AddProductsToCampaignDto } from './dto/add-products.dto';

const OWNER_TYPE_SELLER = 'SELLER';

@Injectable()
export class PromotionCampaignsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, dto: CreateCampaignDto, userRoles?: UserRole[]) {
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
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

    async findOne(id: string, userId: string, userRoles?: UserRole[]) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id },
            include: { vouchers: true },
        });
        if (!campaign) {
            throw new NotFoundException('Chương trình khuyến mãi không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && campaign.ownerType === OWNER_TYPE_SELLER && campaign.ownerId !== userId) {
            throw new ForbiddenException('Bạn không có quyền xem chương trình này');
        }
        return campaign;
    }

    async update(id: string, userId: string, dto: UpdateCampaignDto, userRoles?: UserRole[]) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            throw new NotFoundException('Chương trình khuyến mãi không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
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

    async remove(id: string, userId: string, userRoles?: UserRole[]) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id },
        });
        if (!campaign) {
            throw new NotFoundException('Chương trình khuyến mãi không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException('Bạn chỉ có thể xóa campaign của shop mình');
        }
        await this.prisma.promotionCampaign.delete({ where: { id } });
        return { message: 'Đã xóa chương trình khuyến mãi' };
    }

    async findActiveCampaigns() {
        const now = new Date();
        return this.prisma.promotionCampaign.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { startDate: 'asc' },
            include: {
                vouchers: {
                    where: {
                        isActive: true,
                        startDate: { lte: now },
                        endDate: { gte: now },
                    },
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        minOrderValue: true,
                        maxDiscount: true,
                    },
                },
                campaignProducts: {
                    where: {
                        product: {
                            status: 'APPROVED',
                        },
                    },
                    select: {
                        id: true,
                        campaignPrice: true,
                        discountPercent: true,
                        maxQuantity: true,
                        soldQuantity: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                                price: true,
                                originalPrice: true,
                                stock: true,
                                soldCount: true,
                                ratingAvg: true,
                                ratingCount: true,
                                categoryId: true,
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Lấy chi tiết campaign đang hoạt động (public API)
     */
    async findActiveById(id: string) {
        const now = new Date();
        const campaign = await this.prisma.promotionCampaign.findFirst({
            where: {
                id,
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            include: {
                vouchers: {
                    where: {
                        isActive: true,
                        startDate: { lte: now },
                        endDate: { gte: now },
                    },
                },
                campaignProducts: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });
        if (!campaign) {
            throw new NotFoundException('Chiến dịch không tồn tại hoặc đã kết thúc');
        }
        return campaign;
    }

    async addProducts(
        campaignId: string,
        userId: string,
        dto: AddProductsToCampaignDto,
        userRoles?: UserRole[],
    ) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new NotFoundException('Chiến dịch không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException('Bạn chỉ có thể thêm sản phẩm vào campaign của shop mình');
        }

        // Verify products exist and belong to the seller (if seller campaign)
        const productWhere: Prisma.ProductWhereInput = {
            id: { in: dto.productIds },
        };
        if (campaign.ownerType === OWNER_TYPE_SELLER && campaign.ownerId) {
            productWhere.sellerId = campaign.ownerId;
        }
        const products = await this.prisma.product.findMany({
            where: productWhere,
        });

        if (products.length !== dto.productIds.length) {
            throw new BadRequestException(
                'Một số sản phẩm không tồn tại hoặc không thuộc về shop của bạn',
            );
        }

        // Calculate campaignPrice if discountPercent is provided
        const campaignProducts = dto.productIds.map(productId => {
            const product = products.find(p => p.id === productId);
            let campaignPrice = dto.campaignPrice;

            if (!campaignPrice && dto.discountPercent) {
                campaignPrice = Number(product!.price) * (1 - dto.discountPercent / 100);
            }

            return {
                campaignId,
                productId,
                campaignPrice: campaignPrice ? new Prisma.Decimal(campaignPrice) : undefined,
                discountPercent: dto.discountPercent,
                maxQuantity: dto.maxQuantity,
            };
        });

        // Upsert campaign products (create or update)
        for (const cp of campaignProducts) {
            await this.prisma.campaignProduct.upsert({
                where: {
                    campaignId_productId: {
                        campaignId: cp.campaignId,
                        productId: cp.productId,
                    },
                },
                create: cp,
                update: {
                    campaignPrice: cp.campaignPrice,
                    discountPercent: cp.discountPercent,
                    maxQuantity: cp.maxQuantity,
                },
            });
        }

        return { message: `Đã thêm ${dto.productIds.length} sản phẩm vào chiến dịch` };
    }

    /**
     * Xóa sản phẩm khỏi campaign
     */
    async removeProducts(
        campaignId: string,
        productIds: string[],
        userId: string,
        userRoles?: UserRole[],
    ) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new NotFoundException('Chiến dịch không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException('Bạn chỉ có thể xóa sản phẩm khỏi campaign của shop mình');
        }

        await this.prisma.campaignProduct.deleteMany({
            where: {
                campaignId,
                productId: { in: productIds },
            },
        });

        return { message: `Đã xóa ${productIds.length} sản phẩm khỏi chiến dịch` };
    }

    async bulkAddProducts(
        campaignId: string,
        userId: string,
        dto: {
            products: {
                productId: string;
                campaignPrice?: number;
                discountPercent?: number;
                maxQuantity?: number;
            }[];
        },
        userRoles?: UserRole[],
    ) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            throw new NotFoundException('Chiến dịch không tồn tại');
        }

        // Check permission
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException('Bạn chỉ có thể thêm sản phẩm vào campaign của shop mình');
        }

        // Get all products
        const productIds = dto.products.map(p => p.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (products.length !== productIds.length) {
            throw new BadRequestException('Một số sản phẩm không tồn tại');
        }

        // Create/update campaign products with individual prices
        for (const item of dto.products) {
            const product = products.find(p => p.id === item.productId);
            let campaignPrice = item.campaignPrice;

            // Calculate price if discountPercent is provided
            if (!campaignPrice && item.discountPercent) {
                campaignPrice = Number(product!.price) * (1 - item.discountPercent / 100);
            }

            await this.prisma.campaignProduct.upsert({
                where: {
                    campaignId_productId: {
                        campaignId,
                        productId: item.productId,
                    },
                },
                create: {
                    campaignId,
                    productId: item.productId,
                    campaignPrice: campaignPrice ? new Prisma.Decimal(campaignPrice) : undefined,
                    discountPercent: item.discountPercent,
                    maxQuantity: item.maxQuantity,
                },
                update: {
                    campaignPrice: campaignPrice ? new Prisma.Decimal(campaignPrice) : undefined,
                    discountPercent: item.discountPercent,
                    maxQuantity: item.maxQuantity,
                },
            });
        }

        return { message: `Đã thêm ${dto.products.length} sản phẩm vào chiến dịch` };
    }

    async updateProductPrice(
        campaignId: string,
        productId: string,
        userId: string,
        dto: {
            campaignPrice?: number;
            discountPercent?: number;
            maxQuantity?: number;
        },
        userRoles?: UserRole[],
    ) {
        const campaign = await this.prisma.promotionCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            throw new NotFoundException('Chiến dịch không tồn tại');
        }

        // Check permission
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && (campaign.ownerType !== OWNER_TYPE_SELLER || campaign.ownerId !== userId)) {
            throw new ForbiddenException(
                'Bạn chỉ có thể cập nhật sản phẩm trong campaign của shop mình',
            );
        }

        // Get product to calculate price if needed
        let campaignPrice = dto.campaignPrice;
        if (!campaignPrice && dto.discountPercent) {
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
            });
            if (product) {
                campaignPrice = Number(product.price) * (1 - dto.discountPercent / 100);
            }
        }

        await this.prisma.campaignProduct.update({
            where: {
                campaignId_productId: {
                    campaignId,
                    productId,
                },
            },
            data: {
                campaignPrice: campaignPrice ? new Prisma.Decimal(campaignPrice) : undefined,
                discountPercent: dto.discountPercent,
                maxQuantity: dto.maxQuantity,
            },
        });

        return { message: 'Đã cập nhật giá sản phẩm trong chiến dịch' };
    }

    async getCampaignProducts(campaignId: string) {
        const products = await this.prisma.campaignProduct.findMany({
            where: {
                campaignId,
                product: {
                    status: 'APPROVED',
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                        price: true,
                        originalPrice: true,
                        stock: true,
                        soldCount: true,
                        ratingAvg: true,
                        ratingCount: true,
                    },
                },
            },
            orderBy: { soldQuantity: 'desc' },
        });
        return products;
    }

    async getProductCampaignPrice(productId: string) {
        const now = new Date();
        const campaignProduct = await this.prisma.campaignProduct.findFirst({
            where: {
                productId,
                campaign: {
                    isActive: true,
                    startDate: { lte: now },
                    endDate: { gte: now },
                },
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        if (!campaignProduct) return null;

        return {
            campaignId: campaignProduct.campaign.id,
            campaignName: campaignProduct.campaign.name,
            campaignType: campaignProduct.campaign.type,
            campaignPrice: campaignProduct.campaignPrice,
            discountPercent: campaignProduct.discountPercent,
            maxQuantity: campaignProduct.maxQuantity,
        };
    }
}
