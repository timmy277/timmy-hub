/**
 * Reviews Service
 * Xử lý tạo/lấy review, cập nhật ratingAvg trên Product
 */
import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(userId: string, dto: CreateReviewDto) {
        // 1. Kiểm tra orderItem thuộc về user và order đã DELIVERED
        const orderItem = await this.prisma.orderItem.findFirst({
            where: {
                id: dto.orderItemId,
                productId: dto.productId,
                order: {
                    userId,
                    status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
                },
            },
            include: { order: true },
        });

        if (!orderItem) {
            throw new ForbiddenException(
                'Bạn chỉ có thể đánh giá sản phẩm sau khi xác nhận đã nhận hàng',
            );
        }

        // 2. Chặn review trùng lặp
        if (orderItem.isReviewed) {
            throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
        }

        const existingReview = await this.prisma.review.findUnique({
            where: { orderItemId: dto.orderItemId },
        });
        if (existingReview) {
            throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
        }

        // 3. Tạo review + cập nhật orderItem + cập nhật Product rating trong 1 transaction
        const review = await this.prisma.$transaction(async tx => {
            const newReview = await tx.review.create({
                data: {
                    userId,
                    productId: dto.productId,
                    orderItemId: dto.orderItemId,
                    rating: dto.rating,
                    comment: dto.comment,
                    images: dto.images ?? [],
                    videos: dto.videos ?? [],
                    isVerified: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            profile: {
                                select: {
                                    displayName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });

            // Đánh dấu đã review
            await tx.orderItem.update({
                where: { id: dto.orderItemId },
                data: { isReviewed: true },
            });

            // Tính lại ratingAvg và ratingCount
            const aggregate = await tx.review.aggregate({
                where: { productId: dto.productId },
                _avg: { rating: true },
                _count: { id: true },
            });

            await tx.product.update({
                where: { id: dto.productId },
                data: {
                    ratingAvg: aggregate._avg.rating ?? dto.rating,
                    ratingCount: aggregate._count.id,
                },
            });

            return newReview;
        });

        this.logger.log(`Review created: product ${dto.productId} by user ${userId}`);
        return review;
    }

    async findByProduct(
        productId: string,
        options: {
            page?: number;
            limit?: number;
            rating?: number;
            sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
            currentUserId?: string;
        } = {},
    ) {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: { productId: string; rating?: number } = { productId };
        if (options.rating) where.rating = options.rating;

        const orderBy = (() => {
            switch (options.sort) {
                case 'oldest':
                    return { createdAt: 'asc' as const };
                case 'highest':
                    return { rating: 'desc' as const };
                case 'lowest':
                    return { rating: 'asc' as const };
                case 'helpful':
                    return { helpfulCount: 'desc' as const };
                default:
                    return { createdAt: 'desc' as const };
            }
        })();

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            profile: {
                                select: {
                                    displayName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    // Nếu có currentUserId, load xem user này đã vote cho review chưa
                    ...(options.currentUserId
                        ? {
                              helpfulVotes: {
                                  where: { userId: options.currentUserId },
                                  select: { id: true },
                              },
                          }
                        : {}),
                    comments: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    profile: { select: { displayName: true, avatar: true } },
                                },
                            },
                            replies: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            profile: {
                                                select: { displayName: true, avatar: true },
                                            },
                                        },
                                    },
                                },
                                orderBy: { createdAt: 'asc' },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            }),
            this.prisma.review.count({ where }),
        ]);

        // Map lại result để thêm `hasVotedHelpful` bằng true/false
        const reviewsWithVoteStatus = reviews.map((review: any) => {
            const hasVotedHelpful = review.helpfulVotes && review.helpfulVotes.length > 0;
            // Xóa mảng helpfulVotes ra khỏi response cho sạch
            delete review.helpfulVotes;
            return {
                ...review,
                hasVotedHelpful,
            };
        });

        // Rating breakdown (số lượng mỗi mức sao)
        const breakdown = await this.prisma.review.groupBy({
            by: ['rating'],
            where: { productId },
            _count: { id: true },
        });

        const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        breakdown.forEach(b => {
            ratingBreakdown[b.rating] = b._count.id;
        });

        return {
            reviews: reviewsWithVoteStatus,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            ratingBreakdown,
        };
    }

    /** Toggle helpful vote — một user chỉ vote 1 lần, vote lại để bỏ vote */
    async toggleHelpful(
        reviewId: string,
        userId: string,
    ): Promise<{ helpfulCount: number; voted: boolean }> {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) throw new NotFoundException('Review không tồn tại');

        const existing = await this.prisma.reviewHelpfulVote.findUnique({
            where: { reviewId_userId: { reviewId, userId } },
        });

        if (existing) {
            // Bỏ vote
            await this.prisma.reviewHelpfulVote.delete({
                where: { reviewId_userId: { reviewId, userId } },
            });
            const updated = await this.prisma.review.update({
                where: { id: reviewId },
                data: { helpfulCount: { decrement: 1 } },
                select: { helpfulCount: true },
            });
            return { helpfulCount: Math.max(0, updated.helpfulCount), voted: false };
        } else {
            // Vote
            await this.prisma.reviewHelpfulVote.create({
                data: { reviewId, userId },
            });
            const updated = await this.prisma.review.update({
                where: { id: reviewId },
                data: { helpfulCount: { increment: 1 } },
                select: { helpfulCount: true },
            });
            return { helpfulCount: updated.helpfulCount, voted: true };
        }
    }

    /** Kiểm tra user đã review sản phẩm từ orderItem này chưa */
    async canReview(userId: string, orderItemId: string) {
        const orderItem = await this.prisma.orderItem.findFirst({
            where: {
                id: orderItemId,
                order: {
                    userId,
                    status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
                },
            },
        });

        if (!orderItem) return { canReview: false, reason: 'Chưa xác nhận nhận hàng' };
        if (orderItem.isReviewed) return { canReview: false, reason: 'Đã đánh giá' };

        return { canReview: true };
    }

    /** Comment vào một review */
    async addComment(reviewId: string, userId: string, content: string, parentId?: string) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            include: { product: { select: { slug: true } } },
        });
        if (!review) throw new NotFoundException('Review không tồn tại');

        const comment = await this.prisma.reviewComment.create({
            data: {
                reviewId,
                userId,
                content,
                parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        profile: { select: { displayName: true, avatar: true } },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                profile: { select: { displayName: true, avatar: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        // Gửi thông báo
        // Nếu là Reply, gửi thông báo cho user của parent comment. Nếu không, gửi cho user của review.
        const targetUserId = parentId
            ? (
                  await this.prisma.reviewComment.findUnique({
                      select: { userId: true },
                      where: { id: parentId },
                  })
              )?.userId
            : review.userId;

        if (targetUserId && targetUserId !== userId) {
            const senderName = comment.user.profile?.displayName || 'Ai đó';
            await this.notificationsService.create({
                userId: targetUserId,
                type: NotificationType.REVIEW,
                title: parentId
                    ? 'Có người vừa phản hồi bình luận của bạn'
                    : 'Có người vừa bình luận đánh giá của bạn',
                content: `${senderName}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
                link: `/product/${review.product.slug}`,
            });
        }

        return comment;
    }
}
