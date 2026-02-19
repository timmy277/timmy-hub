import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { BulkAddToCartDto } from './dto/bulk-add-to-cart.dto';
import { ResourceStatus } from '@prisma/client';

const MAX_ITEMS_IN_CART = 50;

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

    async getCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
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

        if (!cart) {
            return {
                id: null,
                items: [],
                itemCount: 0,
                totalAmount: 0,
            };
        }

        // Filter out unavailable products
        const validItems = cart.items.filter(
            item =>
                item.product &&
                item.product.status === ResourceStatus.APPROVED &&
                item.product.stock > 0,
        );

        const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = validItems.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );

        return {
            id: cart.id,
            items: validItems.map(item => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
                subtotal: Number(item.product.price) * item.quantity,
            })),
            itemCount,
            totalAmount,
        };
    }

    async addToCart(userId: string, dto: AddToCartDto) {
        // Validate product
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if (!product) {
            throw new NotFoundException('Sản phẩm không tồn tại');
        }

        if (product.status !== ResourceStatus.APPROVED) {
            throw new BadRequestException('Sản phẩm chưa được phê duyệt');
        }

        if (product.stock < dto.quantity) {
            throw new BadRequestException(`Chỉ còn ${product.stock} sản phẩm trong kho`);
        }

        // Get or create cart
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: { items: true },
            });
        }

        // Check cart item limit
        if (cart.items.length >= MAX_ITEMS_IN_CART) {
            throw new BadRequestException(`Giỏ hàng đã đầy (tối đa ${MAX_ITEMS_IN_CART} sản phẩm)`);
        }

        // Check if product already in cart
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: dto.productId,
                },
            },
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + dto.quantity;

            if (newQuantity > product.stock) {
                throw new BadRequestException(
                    `Chỉ còn ${product.stock} sản phẩm, bạn đã có ${existingItem.quantity} trong giỏ`,
                );
            }

            if (newQuantity > 99) {
                throw new BadRequestException('Số lượng tối đa mỗi sản phẩm là 99');
            }

            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            // Create new item
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: dto.productId,
                    quantity: dto.quantity,
                },
            });
        }

        return this.getCart(userId);
    }

    async updateQuantity(userId: string, itemId: string, quantity: number) {
        // Get cart item
        const item = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true,
            },
        });

        if (!item) {
            throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
        }

        // Verify ownership
        if (item.cart.userId !== userId) {
            throw new ForbiddenException('Không thể thao tác với giỏ hàng của người khác');
        }

        // Remove if quantity = 0
        if (quantity === 0) {
            await this.prisma.cartItem.delete({
                where: { id: itemId },
            });
            return this.getCart(userId);
        }

        // Validate stock
        if (quantity > item.product.stock) {
            throw new BadRequestException(`Chỉ còn ${item.product.stock} sản phẩm trong kho`);
        }

        // Update quantity
        await this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });

        return this.getCart(userId);
    }

    async removeItem(userId: string, itemId: string) {
        // Get cart item
        const item = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!item) {
            throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
        }

        // Verify ownership
        if (item.cart.userId !== userId) {
            throw new ForbiddenException('Không thể thao tác với giỏ hàng của người khác');
        }

        await this.prisma.cartItem.delete({
            where: { id: itemId },
        });

        return this.getCart(userId);
    }

    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        return { message: 'Đã xóa tất cả sản phẩm trong giỏ hàng' };
    }

    async bulkAddToCart(userId: string, dto: BulkAddToCartDto) {
        const results: Array<{ productId: string; success: true }> = [];
        const errors: Array<{ productId: string; success: false; message: string }> = [];

        for (const item of dto.items) {
            try {
                await this.addToCart(userId, item);
                results.push({ productId: item.productId, success: true });
            } catch (error) {
                errors.push({
                    productId: item.productId,
                    success: false,
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        const cart = await this.getCart(userId);

        return {
            cart,
            summary: {
                total: dto.items.length,
                success: results.length,
                failed: errors.length,
            },
            errors: errors.length > 0 ? errors : undefined,
        };
    }

    async validateCart(userId: string) {
        const cart = await this.getCart(userId);
        const errors: Array<{
            itemId: string;
            productId: string;
            productName: string;
            message: string;
            availableStock?: number;
            requestedQuantity?: number;
        }> = [];

        for (const item of cart.items) {
            if (item.quantity > item.product.stock) {
                errors.push({
                    itemId: item.id,
                    productId: item.product.id,
                    productName: item.product.name,
                    message: `Sản phẩm chỉ còn ${item.product.stock}, bạn đang có ${item.quantity} trong giỏ`,
                    availableStock: item.product.stock,
                    requestedQuantity: item.quantity,
                });
            }

            if (item.product.status !== ResourceStatus.APPROVED) {
                errors.push({
                    itemId: item.id,
                    productId: item.product.id,
                    productName: item.product.name,
                    message: 'Sản phẩm không còn khả dụng',
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            cart,
        };
    }
}
