import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePostDto, UpdatePostDto, GetPostsDto } from './dto/post.dto';
import { UserRole, PostStatus } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) {}

    private postInclude = {
        seller: {
            select: {
                id: true,
                profile: {
                    select: { displayName: true, firstName: true, lastName: true, avatar: true },
                },
                sellerProfile: { select: { shopName: true, shopSlug: true, shopLogo: true } },
            },
        },
        productTags: {
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        originalPrice: true,
                        images: true,
                        ratingAvg: true,
                    },
                },
            },
            orderBy: { position: 'asc' as const },
        },
        _count: { select: { likes: true, comments: true } },
    };

    // ── Feed công khai ────────────────────────────────────────────────────────

    async getFeed(dto: GetPostsDto) {
        const { cursor, limit = 12, sellerId, hashtag } = dto;
        const take = Number(limit) + 1; // lấy thêm 1 để biết còn data không

        const where = {
            status: PostStatus.PUBLISHED,
            ...(sellerId && { sellerId }),
            ...(hashtag && { hashtags: { has: hashtag } }),
        };

        const posts = await this.prisma.post.findMany({
            where,
            include: this.postInclude,
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
            take,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });

        const hasMore = posts.length > Number(limit);
        const data = hasMore ? posts.slice(0, Number(limit)) : posts;
        const nextCursor = hasMore ? data[data.length - 1].id : null;

        return { data, nextCursor, hasMore };
    }

    async getMyPosts(sellerId: string, dto: GetPostsDto) {
        const { cursor, limit = 12 } = dto;
        const take = Number(limit) + 1;

        const posts = await this.prisma.post.findMany({
            where: { sellerId },
            include: this.postInclude,
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
            take,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });

        const hasMore = posts.length > Number(limit);
        const data = hasMore ? posts.slice(0, Number(limit)) : posts;
        const nextCursor = hasMore ? data[data.length - 1].id : null;

        return { data, nextCursor, hasMore };
    }

    // ── Chi tiết post ─────────────────────────────────────────────────────────

    async findOne(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: this.postInclude,
        });
        if (!post) throw new NotFoundException('Không tìm thấy bài đăng');

        // Tăng view count
        void this.prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });

        return post;
    }

    // ── Tạo post ──────────────────────────────────────────────────────────────

    async create(sellerId: string, dto: CreatePostDto) {
        const { productIds, ...data } = dto;

        const post = await this.prisma.post.create({
            data: {
                ...data,
                sellerId,
                productTags: productIds?.length
                    ? {
                          create: productIds.map((productId, position) => ({
                              productId,
                              position,
                          })),
                      }
                    : undefined,
            },
            include: this.postInclude,
        });

        return post;
    }

    // ── Cập nhật post ─────────────────────────────────────────────────────────

    async update(id: string, userId: string, dto: UpdatePostDto) {
        const post = await this.findOne(id);
        if (post.sellerId !== userId) throw new ForbiddenException('Không có quyền chỉnh sửa');

        const { productIds, ...data } = dto;

        // Cập nhật product tags nếu có
        if (productIds !== undefined) {
            await this.prisma.postProduct.deleteMany({ where: { postId: id } });
            if (productIds.length > 0) {
                await this.prisma.postProduct.createMany({
                    data: productIds.map((productId, position) => ({
                        postId: id,
                        productId,
                        position,
                    })),
                });
            }
        }

        return this.prisma.post.update({
            where: { id },
            data,
            include: this.postInclude,
        });
    }

    // ── Xóa post ──────────────────────────────────────────────────────────────

    async delete(id: string, userId: string, userRoles: UserRole[]) {
        const post = await this.findOne(id);
        const isAdmin =
            userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.SUPER_ADMIN);
        if (post.sellerId !== userId && !isAdmin)
            throw new ForbiddenException('Không có quyền xóa');

        await this.prisma.post.delete({ where: { id } });
        return { message: 'Đã xóa bài đăng' };
    }

    // ── Like / Unlike ─────────────────────────────────────────────────────────

    async toggleLike(postId: string, userId: string) {
        const existing = await this.prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });

        if (existing) {
            await this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
            await this.prisma.post.update({
                where: { id: postId },
                data: { likeCount: { decrement: 1 } },
            });
            return { liked: false };
        }

        await this.prisma.postLike.create({ data: { postId, userId } });
        await this.prisma.post.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } },
        });
        return { liked: true };
    }

    // ── Comment ───────────────────────────────────────────────────────────────

    async addComment(postId: string, userId: string, content: string, parentId?: string) {
        await this.findOne(postId);
        const comment = await this.prisma.postComment.create({
            data: { postId, userId, content, parentId },
        });
        await this.prisma.post.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } },
        });
        return comment;
    }

    getComments(postId: string) {
        return this.prisma.postComment.findMany({
            where: { postId, parentId: null },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
}
