import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UserRole, VoucherType, PaymentMethod, ResourceStatus } from '@prisma/client';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class VouchersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(
        userId: string,
        dto: CreateVoucherDto,
        campaignId?: string,
        userRoles?: UserRole[],
    ) {
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        const sellerId = isAdmin && dto.sellerId !== undefined ? dto.sellerId : userId;

        const existing = await this.prisma.voucher.findUnique({
            where: { code: dto.code.trim().toUpperCase() },
        });
        if (existing) {
            throw new BadRequestException('Mã voucher đã tồn tại');
        }
        const cid = campaignId ?? dto.campaignId;
        if (cid) {
            const campaign = await this.prisma.promotionCampaign.findUnique({
                where: { id: cid },
            });
            if (!campaign) {
                throw new BadRequestException('Chương trình khuyến mãi không tồn tại');
            }
            if (sellerId != null) {
                if (campaign.ownerType !== 'SELLER' || campaign.ownerId !== sellerId) {
                    throw new BadRequestException('Campaign không thuộc shop này');
                }
            } else {
                if (campaign.ownerType !== 'PLATFORM') {
                    throw new BadRequestException('Voucher sàn chỉ gắn campaign sàn');
                }
            }
        }
        const start = dto.startDate ? new Date(dto.startDate) : new Date();
        const end = dto.endDate
            ? new Date(dto.endDate)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        if (end <= start) {
            throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
        }
        const voucher = await this.prisma.voucher.create({
            data: {
                code: dto.code.trim().toUpperCase(),
                type: dto.type,
                value: dto.value,
                minOrderValue: dto.minOrderValue ?? undefined,
                maxDiscount: dto.maxDiscount ?? undefined,
                usageLimit: dto.usageLimit ?? undefined,
                perUserLimit: dto.perUserLimit ?? 1,
                startDate: start,
                endDate: end,
                description: dto.description ?? undefined,
                categoryIds: dto.categoryIds ?? [],
                productIds: dto.productIds ?? [],
                paymentMethods: (dto.paymentMethods as string[]) ?? [],
                sellerId: sellerId ?? undefined,
                campaignId: cid ?? undefined,
            },
        });

        // Push PROMOTION notifications asynchronously
        void (async () => {
            try {
                if (sellerId) {
                    const products = await this.prisma.product.findMany({
                        where: { sellerId },
                        select: { id: true },
                    });
                    const productIds = products.map(p => p.id);
                    // Find users who have ordered from this seller before
                    const pastOrders = await this.prisma.orderItem.findMany({
                        where: { productId: { in: productIds } },
                        include: { order: { select: { userId: true } } },
                        distinct: ['orderId'],
                    });

                    const uniqueUserIds = [...new Set(pastOrders.map(item => item.order.userId))];
                    for (const uid of uniqueUserIds) {
                        await this.notificationsService.create({
                            userId: uid,
                            type: NotificationType.PROMOTION,
                            title: 'Voucher giảm giá mới',
                            content: `Shop bạn từng mua vừa tung mã giảm giá: ${voucher.code}. Nhanh tay kẻo lỡ!`,
                            link: `/profile/vouchers`,
                        });
                    }
                } else {
                    // Platform voucher - send to recent active users (limit 10 for demo)
                    const recentUsers = await this.prisma.user.findMany({
                        orderBy: { lastLoginAt: 'desc' },
                        take: 10,
                        select: { id: true },
                    });
                    for (const user of recentUsers) {
                        await this.notificationsService.create({
                            userId: user.id,
                            type: NotificationType.PROMOTION,
                            title: 'Khuyến mãi khủng từ nền tảng',
                            content: `Mã ${voucher.code} vừa được tung ra. Áp dụng ngay nào!`,
                            link: `/profile/vouchers`,
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to send promotion notifications', err);
            }
        })();

        return voucher;
    }

    async findAllBySeller(sellerId: string) {
        return this.prisma.voucher.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' },
            include: { campaign: { select: { id: true, name: true } } },
        });
    }

    async findAllAdmin(sellerId?: string) {
        return this.prisma.voucher.findMany({
            where: sellerId !== undefined ? { sellerId } : {},
            orderBy: { createdAt: 'desc' },
            include: {
                campaign: { select: { id: true, name: true } },
                seller: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
            },
        });
    }

    async findOne(id: string, userId: string, userRoles: UserRole[]) {
        const voucher = await this.prisma.voucher.findUnique({
            where: { id },
            include: { campaign: true },
        });
        if (!voucher) {
            throw new NotFoundException('Voucher không tồn tại');
        }
        const isAdmin =
            userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.ADMIN);
        if (voucher.sellerId && voucher.sellerId !== userId && !isAdmin) {
            throw new ForbiddenException('Bạn không có quyền xem voucher này');
        }
        return voucher;
    }

    async update(id: string, userId: string, dto: UpdateVoucherDto, userRoles?: UserRole[]) {
        const voucher = await this.prisma.voucher.findUnique({ where: { id } });
        if (!voucher) {
            throw new NotFoundException('Voucher không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && voucher.sellerId !== userId) {
            throw new ForbiddenException('Bạn chỉ có thể sửa voucher của shop mình');
        }
        const data: Prisma.VoucherUpdateInput = { ...dto };
        if (dto.startDate) data.startDate = new Date(dto.startDate);
        if (dto.endDate) data.endDate = new Date(dto.endDate);
        if (dto.code) data.code = dto.code.trim().toUpperCase();
        return this.prisma.voucher.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, userId: string, userRoles?: UserRole[]) {
        const voucher = await this.prisma.voucher.findUnique({ where: { id } });
        if (!voucher) {
            throw new NotFoundException('Voucher không tồn tại');
        }
        const isAdmin =
            userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.SUPER_ADMIN);
        if (!isAdmin && voucher.sellerId !== userId) {
            throw new ForbiddenException('Bạn chỉ có thể xóa voucher của shop mình');
        }
        await this.prisma.voucher.delete({ where: { id } });
        return { message: 'Đã xóa voucher' };
    }

    /**
     * Validate voucher for current user's cart and return discount amount.
     * Used at checkout: cart from DB, paymentMethod from request.
     */
    async validate(
        code: string,
        userId: string,
        paymentMethod: PaymentMethod,
    ): Promise<{
        valid: boolean;
        voucherId?: string;
        code?: string;
        discount?: number;
        message?: string;
        type?: VoucherType;
        description?: string;
    }> {
        const now = new Date();
        const voucher = await this.prisma.voucher.findUnique({
            where: { code: code.trim().toUpperCase() },
        });
        if (!voucher) {
            return { valid: false, message: 'Mã voucher không tồn tại' };
        }
        if (!voucher.isActive) {
            return { valid: false, message: 'Voucher đã bị tắt' };
        }
        if (now < voucher.startDate || now > voucher.endDate) {
            return { valid: false, message: 'Voucher chưa đến hạn hoặc đã hết hạn' };
        }
        if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
            return { valid: false, message: 'Voucher đã hết lượt sử dụng' };
        }

        const usedByUser = await this.prisma.voucherUsageLog.count({
            where: { voucherId: voucher.id, userId },
        });
        if (usedByUser >= voucher.perUserLimit) {
            return { valid: false, message: 'Bạn đã dùng hết lượt voucher này' };
        }

        if (voucher.paymentMethods?.length && !voucher.paymentMethods.includes(paymentMethod)) {
            return {
                valid: false,
                message: 'Voucher không áp dụng cho phương thức thanh toán này',
            };
        }

        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            return { valid: false, message: 'Giỏ hàng trống' };
        }

        const validItems = cart.items.filter(
            item =>
                item.product &&
                item.product.status === ResourceStatus.APPROVED &&
                item.product.stock >= item.quantity,
        );
        if (validItems.length === 0) {
            return { valid: false, message: 'Không có sản phẩm hợp lệ trong giỏ' };
        }

        if (voucher.sellerId) {
            const hasSellerProduct = validItems.some(
                item => item.product.sellerId === voucher.sellerId,
            );
            if (!hasSellerProduct) {
                return { valid: false, message: 'Voucher chỉ áp dụng cho sản phẩm của shop này' };
            }
        }

        if (voucher.categoryIds?.length) {
            const hasCategory = validItems.some(
                item =>
                    item.product?.categoryId &&
                    voucher.categoryIds.includes(item.product.categoryId),
            );
            if (!hasCategory) {
                return { valid: false, message: 'Voucher không áp dụng cho sản phẩm trong giỏ' };
            }
        }
        if (voucher.productIds?.length) {
            const hasProduct = validItems.some(item => voucher.productIds.includes(item.productId));
            if (!hasProduct) {
                return { valid: false, message: 'Voucher không áp dụng cho sản phẩm trong giỏ' };
            }
        }

        const totalAmount = validItems.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );
        if (voucher.minOrderValue != null && totalAmount < voucher.minOrderValue) {
            return {
                valid: false,
                message: `Đơn tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} VND`,
            };
        }

        let discount = 0;
        if (voucher.type === VoucherType.PERCENTAGE) {
            discount = (totalAmount * voucher.value) / 100;
            if (voucher.maxDiscount != null && discount > voucher.maxDiscount) {
                discount = voucher.maxDiscount;
            }
        } else if (voucher.type === VoucherType.FIXED_AMOUNT) {
            discount = voucher.value;
            if (discount > totalAmount) discount = totalAmount;
        } else if (voucher.type === VoucherType.FREE_SHIPPING) {
            discount = 0;
        }

        return {
            valid: true,
            voucherId: voucher.id,
            code: voucher.code,
            discount: Math.round(discount),
            type: voucher.type,
            description: voucher.description ?? undefined,
        };
    }

    async findAvailableForCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: { include: { product: true } },
            },
        });

        const now = new Date();
        const activeVouchers = await this.prisma.voucher.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                OR: [
                    { usageLimit: null },
                    { usageLimit: { gt: this.prisma.voucher.fields.usedCount } },
                ],
            },
            include: { campaign: true },
        });

        const available: Array<Prisma.VoucherGetPayload<{ include: { campaign: true } }>> = [];

        // Check if user has cart items to validate against
        if (!cart || cart.items.length === 0) {
            return [];
        }

        const validItems = cart.items.filter(
            item =>
                item.product &&
                item.product.status === ResourceStatus.APPROVED &&
                item.product.stock >= item.quantity,
        );
        if (validItems.length === 0) {
            return [];
        }

        // Just use a dummy payment method for standard checks since we don't know it yet
        const dummyPaymentMethod = PaymentMethod.VNPAY;

        for (const voucher of activeVouchers) {
            const result = await this.validate(voucher.code, userId, dummyPaymentMethod);
            // It might be invalid due to payment method mismatch, but we can still suggest it
            // Let's manually do a soft check, bypassing paymentMethod strictly, or just use validate and clear the constraint
            if (
                result.valid ||
                result.message === 'Voucher không áp dụng cho phương thức thanh toán này'
            ) {
                available.push(voucher);
            }
        }

        return available;
    }

    async getReport(sellerId?: string) {
        const where = sellerId ? { sellerId } : {};

        const totalVouchers = await this.prisma.voucher.count({ where });
        const totalUsed = await this.prisma.voucherUsageLog.count({
            where: sellerId ? { voucher: { sellerId } } : {},
        });
        const totalDiscountAgg = await this.prisma.voucherUsageLog.aggregate({
            _sum: { discount: true },
            where: sellerId ? { voucher: { sellerId } } : {},
        });

        const activeVouchers = await this.prisma.voucher.count({
            where: {
                ...where,
                isActive: true,
            },
        });

        return {
            totalVouchers,
            activeVouchers,
            totalUsed,
            totalDiscount: totalDiscountAgg._sum.discount ?? 0,
        };
    }
}
