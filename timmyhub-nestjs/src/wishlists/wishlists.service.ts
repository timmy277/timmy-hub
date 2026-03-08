import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WishlistsService {
    constructor(private readonly prisma: PrismaService) {}

    async getMyWishlist(userId: string) {
        return await this.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                        price: true,
                        originalPrice: true,
                        discount: true,
                        ratingAvg: true,
                        ratingCount: true,
                        soldCount: true,
                        stock: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleWishlist(userId: string, productId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

        const existing = await this.prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId } },
        });

        if (existing) {
            await this.prisma.wishlistItem.delete({
                where: { id: existing.id },
            });
            return { message: 'Đã bỏ khỏi danh sách yêu thích', isWishlisted: false };
        } else {
            await this.prisma.wishlistItem.create({
                data: { userId, productId },
            });
            return { message: 'Đã thêm vào danh sách yêu thích', isWishlisted: true };
        }
    }

    async checkWishlist(userId: string, productId: string) {
        const existing = await this.prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        return { isWishlisted: !!existing };
    }
}
