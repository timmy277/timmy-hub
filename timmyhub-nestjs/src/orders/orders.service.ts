import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus, PaymentMethod, PaymentStatus, ResourceStatus } from '@prisma/client';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}

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

        const totalAmount = validItems.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );

        const order = await this.prisma.$transaction(async tx => {
            const order = await tx.order.create({
                data: {
                    userId,
                    status: OrderStatus.PENDING,
                    totalAmount,
                    paymentStatus: PaymentStatus.PENDING,
                    paymentMethod,
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

    async updateStatus(id: string, status: OrderStatus) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new NotFoundException('Đơn hàng không tồn tại');
        }
        return this.prisma.order.update({
            where: { id },
            data: { status },
            include: { orderItems: true, payment: true },
        });
    }
}
