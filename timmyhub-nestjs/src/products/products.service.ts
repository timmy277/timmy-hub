import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ResourceStatus, Product, UserRole, Prisma } from '@prisma/client';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private searchService: SearchService,
    ) {}

    async create(sellerId: string, dto: CreateProductDto): Promise<Product> {
        const existingSlug = await this.prisma.product.findUnique({
            where: { slug: dto.slug },
        });
        if (existingSlug) throw new ConflictException('Slug sản phẩm đã tồn tại');

        if (dto.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: dto.sku },
            });
            if (existingSku) throw new ConflictException('Mã SKU đã tồn tại');
        }

        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) throw new NotFoundException('Danh mục không tồn tại');
        }

        return this.prisma.product.create({
            data: {
                ...dto,
                sellerId,
                status: ResourceStatus.PENDING,
            },
        });
    }

    async findAll(): Promise<Product[]> {
        return this.prisma.product.findMany({
            where: { status: ResourceStatus.APPROVED },
            orderBy: { createdAt: 'desc' },
            include: { category: true },
        });
    }

    async findWithFilters(params: {
        page: number;
        limit: number;
        categoryId?: string;
        brandId?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        sellerId?: string;
        sort?: 'newest' | 'best_selling' | 'price_asc' | 'price_desc' | 'rating';
    }) {
        const { page, limit, categoryId, brandId, minPrice, maxPrice, minRating, sellerId, sort } =
            params;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ProductWhereInput = {
            status: ResourceStatus.APPROVED,
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (brandId) {
            where.brandId = brandId;
        }

        if (sellerId) {
            where.sellerId = sellerId;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        if (minRating !== undefined) {
            where.ratingAvg = { gte: minRating };
        }

        // Build orderBy
        let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
        switch (sort) {
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'best_selling':
                orderBy = { soldCount: 'desc' };
                break;
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'rating':
                orderBy = { ratingAvg: 'desc' };
                break;
        }

        // Execute query
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    category: true,
                    seller: {
                        select: {
                            id: true,
                            profile: true,
                            sellerProfile: { select: { shopName: true, shopSlug: true } },
                        },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findAllPending(): Promise<Product[]> {
        return this.prisma.product.findMany({
            where: { status: ResourceStatus.PENDING },
            orderBy: { createdAt: 'desc' },
            include: {
                seller: { select: { id: true, email: true, profile: true } },
                category: true,
            },
        });
    }

    async findAllAdmin(): Promise<Product[]> {
        return this.prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                seller: { select: { id: true, email: true, profile: true } },
                category: true,
            },
        });
    }

    async findAllBySeller(sellerId: string): Promise<Product[]> {
        return this.prisma.product.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' },
            include: { category: true },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                seller: { select: { email: true, profile: true } },
                category: true,
                variants: true,
            },
        });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        return product;
    }

    async findBySlug(slug: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: true,
                seller: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                        sellerProfile: {
                            select: {
                                id: true,
                                shopName: true,
                                shopSlug: true,
                                shopLogo: true,
                                description: true,
                                isVerified: true,
                                rating: true,
                            },
                        },
                    },
                },
            },
        });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        if (product.status !== ResourceStatus.APPROVED) {
            throw new BadRequestException('Sản phẩm này chưa được phê duyệt');
        }
        return product;
    }

    async approve(id: string, adminId: string): Promise<Product> {
        const product = await this.findOne(id);
        if (product.status === ResourceStatus.APPROVED) {
            throw new BadRequestException('Sản phẩm này đã được duyệt trước đó');
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                status: ResourceStatus.APPROVED,
                reviewedById: adminId,
                reviewNote: 'Đã duyệt bởi hệ thống',
            },
        });

        // Index vào Elasticsearch sau khi duyệt
        void this.searchService.indexProduct(id);
        return updated;
    }

    async reject(id: string, adminId: string, note: string): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data: {
                status: ResourceStatus.REJECTED,
                reviewedById: adminId,
                reviewNote: note,
            },
        });
    }

    async update(id: string, userId: string, dto: Partial<CreateProductDto>): Promise<Product> {
        const product = await this.findOne(id);

        // Get user để check role
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { roles: true },
        });

        if (!user) throw new NotFoundException('Người dùng không tồn tại');

        if (user.roles.includes(UserRole.SELLER) && product.sellerId !== userId) {
            throw new ForbiddenException('Bạn chỉ có thể cập nhật sản phẩm của mình');
        }

        if (dto.slug && dto.slug !== product.slug) {
            const existingSlug = await this.prisma.product.findUnique({
                where: { slug: dto.slug },
            });
            if (existingSlug) throw new ConflictException('Slug sản phẩm đã tồn tại');
        }

        if (dto.sku && dto.sku !== product.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: dto.sku },
            });
            if (existingSku) throw new ConflictException('Mã SKU đã tồn tại');
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: dto,
        });

        if (updated.status === ResourceStatus.APPROVED) {
            void this.searchService.indexProduct(id);
        }

        return updated;
    }

    async delete(id: string, userId: string): Promise<Product> {
        const product = await this.findOne(id);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { roles: true },
        });

        if (!user) throw new NotFoundException('Người dùng không tồn tại');

        if (user.roles.includes(UserRole.SELLER) && product.sellerId !== userId) {
            throw new ForbiddenException('Bạn chỉ có thể xóa sản phẩm của mình');
        }

        if (product.soldCount > 0) {
            throw new ForbiddenException(
                'Không thể xóa sản phẩm đã có đơn hàng. Bạn có thể đặt trạng thái DELETED.',
            );
        }

        const deleted = await this.prisma.product.update({
            where: { id },
            data: { status: ResourceStatus.DELETED },
        });

        void this.searchService.removeProduct(id);
        return deleted;
    }
}
