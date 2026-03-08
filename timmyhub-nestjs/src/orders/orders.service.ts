import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ResourceStatus,
    NotificationType,
} from '@prisma/client';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly vouchersService: VouchersService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async createFromCart(userId: string, dto: CreateOrderFromCartDto) {
        const paymentMethod = dto.paymentMethod ?? PaymentMethod.VNPAY;

        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Giỏ hàng trống');
        }

        const validItems = cart.items.filter(
            item =>
                item.product &&
                item.product.status === ResourceStatus.APPROVED &&
                item.product.stock >= item.quantity,
        );

        if (validItems.length === 0) {
            throw new BadRequestException('Không có sản phẩm hợp lệ trong giỏ hàng');
        }

        let totalAmount = validItems.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );
        let voucherId: string | undefined;
        let voucherDiscount: number | undefined;
        if (dto.voucherCode?.trim()) {
            const validation = await this.vouchersService.validate(
                dto.voucherCode.trim(),
                userId,
                paymentMethod,
            );
            if (!validation.valid || !validation.voucherId) {
                throw new BadRequestException(validation.message ?? 'Mã voucher không hợp lệ');
            }
            voucherId = validation.voucherId;
            voucherDiscount = validation.discount ?? 0;
            if (voucherDiscount > 0) {
                totalAmount = Math.max(0, totalAmount - voucherDiscount);
            }
        }

        const order = await this.prisma.$transaction(async tx => {
            const order = await tx.order.create({
                data: {
                    userId,
                    status: OrderStatus.PENDING,
                    totalAmount,
                    paymentStatus: PaymentStatus.PENDING,
                    paymentMethod,
                    voucherId: voucherId ?? undefined,
                    voucherDiscount: voucherDiscount != null ? voucherDiscount : undefined,
                },
            });

            for (const item of validItems) {
                const subtotal = Number(item.product.price) * item.quantity;
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.product.id,
                        name: item.product.name,
                        image: Array.isArray(item.product.images) ? item.product.images[0] : null,
                        price: item.product.price,
                        quantity: item.quantity,
                        subtotal,
                    },
                });
                await tx.product.update({
                    where: { id: item.product.id },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return tx.order.findUnique({
                where: { id: order.id },
                include: { orderItems: true },
            });
        });

        // Bắn thông báo tạo đơn hàng
        if (order) {
            await this.notificationsService.create({
                userId,
                type: NotificationType.ORDER,
                title: 'Đặt hàng thành công',
                content: `Đơn hàng #${order.id.slice(-6).toUpperCase()} của bạn đã được đặt thành công.`,
                link: `/profile/orders`,
            });
        }

        return order!;
    }

    async findAll(userId: string, status?: OrderStatus) {
        const where: { userId: string; status?: OrderStatus } = { userId };
        if (status) where.status = status;

        const orders = await this.prisma.order.findMany({
            where,
            include: { orderItems: true },
            orderBy: { createdAt: 'desc' },
        });
        return orders;
    }

    async findOne(id: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: { orderItems: true, payment: true },
        });
        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }
        return order;
    }

    async findAllAdmin(status?: OrderStatus) {
        const where = status ? { status } : {};
        return this.prisma.order.findMany({
            where,
            include: {
                orderItems: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { firstName: true, lastName: true, displayName: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOneAdmin(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: true,
                payment: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { firstName: true, lastName: true, displayName: true } },
                    },
                },
            },
        });
        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }
        return order;
    }

    /**
     * Người mua xác nhận đã nhận hàng → COMPLETED
     * Chỉ cho phép từ SHIPPING hoặc DELIVERED
     */
    async confirmReceived(id: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
        });

        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }

        const terminalStatuses: OrderStatus[] = [
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
            OrderStatus.RETURNED,
            OrderStatus.REFUNDED,
        ];
        if (terminalStatuses.includes(order.status)) {
            throw new BadRequestException('Đơn hàng đã ở trạng thái cuối, không thể xác nhận');
        }

        if (order.paymentStatus !== PaymentStatus.COMPLETED) {
            throw new BadRequestException('Đơn hàng chưa được thanh toán');
        }

        return this.prisma.order.update({
            where: { id },
            data: { status: OrderStatus.COMPLETED },
            include: { orderItems: true },
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { orderItems: true },
        });
        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }

        return this.prisma.$transaction(async tx => {
            const updatedOrder = await tx.order.update({
                where: { id },
                data: { status },
                include: { orderItems: true, payment: true },
            });

            // Logic 1: COD order confirmed -> record voucher usage
            if (
                order.status === OrderStatus.PENDING &&
                (status === OrderStatus.CONFIRMED || status === OrderStatus.PROCESSING) &&
                order.paymentMethod === PaymentMethod.COD
            ) {
                if (order.voucherId) {
                    const existingLog = await tx.voucherUsageLog.findUnique({
                        where: {
                            voucherId_orderId: { voucherId: order.voucherId, orderId: order.id },
                        },
                    });
                    if (!existingLog) {
                        await tx.voucherUsageLog.create({
                            data: {
                                voucherId: order.voucherId,
                                userId: order.userId,
                                orderId: order.id,
                                discount: Number(order.voucherDiscount ?? 0),
                            },
                        });
                        await tx.voucher.update({
                            where: { id: order.voucherId },
                            data: { usedCount: { increment: 1 } },
                        });
                    }
                }
            }

            // Logic 2: Order cancelled/returned -> restore voucher quota and product stock
            if (
                // Only if previous status wasn't already cancelled/returned
                order.status !== OrderStatus.CANCELLED &&
                order.status !== OrderStatus.RETURNED &&
                (status === OrderStatus.CANCELLED || status === OrderStatus.RETURNED)
            ) {
                // Restore voucher quota
                if (order.voucherId) {
                    const usageLog = await tx.voucherUsageLog.findUnique({
                        where: {
                            voucherId_orderId: { voucherId: order.voucherId, orderId: order.id },
                        },
                    });
                    if (usageLog) {
                        // Delete or mark void. We will delete the usage log based on @@unique
                        await tx.voucherUsageLog.delete({
                            where: { id: usageLog.id },
                        });
                        await tx.voucher.update({
                            where: { id: order.voucherId },
                            data: { usedCount: { decrement: 1 } },
                        });
                    }
                }

                // Restore product stock
                for (const item of order.orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
            }

            // Bắn thông báo cập nhật trạng thái đơn hàng
            await this.notificationsService.create({
                userId: updatedOrder.userId,
                type: NotificationType.ORDER,
                title: 'Cập nhật đơn hàng',
                content: `Đơn hàng #${updatedOrder.id.slice(-6).toUpperCase()} đã chuyển sang trạng thái: ${status}.`,
                link: `/profile/orders`,
            });

            return updatedOrder;
        });
    }
}
