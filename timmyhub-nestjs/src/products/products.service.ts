import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ResourceStatus, Product, UserRole } from '@prisma/client';

/**
 * Service quản lý sản phẩm và quy trình phê duyệt
 * @author TimmyHub AI
 */
@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    /**
     * Tạo sản phẩm mới (chờ duyệt)
     */
    async create(sellerId: string, dto: CreateProductDto): Promise<Product> {
        // Kiểm tra slug
        const existingSlug = await this.prisma.product.findUnique({
            where: { slug: dto.slug },
        });
        if (existingSlug) throw new ConflictException('Slug sản phẩm đã tồn tại');

        // Kiểm tra SKU nếu có
        if (dto.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: dto.sku },
            });
            if (existingSku) throw new ConflictException('Mã SKU đã tồn tại');
        }

        // Kiểm tra Category
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

    /**
     * Lấy danh sách sản phẩm
     * @param includePending Nếu true, lấy toàn bộ cho Admin/Seller. Nếu false, chỉ lấy sản phẩm đã duyệt cho Public.
     */
    async findAll(includePending = false): Promise<Product[]> {
        if (includePending) {
            return this.prisma.product.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    seller: { select: { email: true, profile: true } },
                    category: true,
                },
            });
        }
        return this.prisma.product.findMany({
            where: { status: ResourceStatus.APPROVED },
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
            },
        });
    }

    /**
     * Xem chi tiết sản phẩm
     */
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

    /**
     * Lấy sản phẩm qua slug (Public)
     */
    async findBySlug(slug: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: true,
            },
        });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        if (product.status !== ResourceStatus.APPROVED) {
            throw new BadRequestException('Sản phẩm này chưa được phê duyệt');
        }
        return product;
    }

    /**
     * Phê duyệt sản phẩm (Admin)
     */
    async approve(id: string, adminId: string): Promise<Product> {
        const product = await this.findOne(id);
        if (product.status === ResourceStatus.APPROVED) {
            throw new BadRequestException('Sản phẩm này đã được duyệt trước đó');
        }

        return this.prisma.product.update({
            where: { id },
            data: {
                status: ResourceStatus.APPROVED,
                reviewedById: adminId,
                reviewNote: 'Đã duyệt bởi hệ thống',
            },
        });
    }

    /**
     * Từ chối sản phẩm (Admin)
     */
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

    /**
     * Cập nhật sản phẩm (CASL Policy Check)
     * SELLER chỉ có thể update sản phẩm của mình
     * ADMIN có thể update bất kỳ sản phẩm nào
     */
    async update(id: string, userId: string, dto: Partial<CreateProductDto>): Promise<Product> {
        const product = await this.findOne(id);

        // Get user để check role
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { roles: true },
        });

        if (!user) throw new NotFoundException('Người dùng không tồn tại');

        // CASL đã check quyền Update Product
        // Nhưng cần check ownership nếu là SELLER
        if (user.roles.includes(UserRole.SELLER) && product.sellerId !== userId) {
            throw new ForbiddenException('Bạn chỉ có thể cập nhật sản phẩm của mình');
        }

        // Check slug nếu có thay đổi
        if (dto.slug && dto.slug !== product.slug) {
            const existingSlug = await this.prisma.product.findUnique({
                where: { slug: dto.slug },
            });
            if (existingSlug) throw new ConflictException('Slug sản phẩm đã tồn tại');
        }

        // Check SKU nếu có thay đổi
        if (dto.sku && dto.sku !== product.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: dto.sku },
            });
            if (existingSku) throw new ConflictException('Mã SKU đã tồn tại');
        }

        return this.prisma.product.update({
            where: { id },
            data: dto,
        });
    }

    /**
     * Xóa sản phẩm (CASL Policy Check)
     * Không thể xóa sản phẩm đã có đơn hàng (soldCount > 0)
     * SELLER chỉ có thể xóa sản phẩm của mình
     */
    async delete(id: string, userId: string): Promise<Product> {
        const product = await this.findOne(id);

        // Get user để check role
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { roles: true },
        });

        if (!user) throw new NotFoundException('Người dùng không tồn tại');

        // Check ownership nếu là SELLER
        if (user.roles.includes(UserRole.SELLER) && product.sellerId !== userId) {
            throw new ForbiddenException('Bạn chỉ có thể xóa sản phẩm của mình');
        }

        // CASL rule: cannot(Action.Delete, 'Product', { soldCount: { $gt: 0 } })
        // Nhưng trong service ta cần check manual vì DB không support mongo query
        if (product.soldCount > 0) {
            throw new ForbiddenException(
                'Không thể xóa sản phẩm đã có đơn hàng. Bạn có thể đặt trạng thái DELETED.',
            );
        }

        // Soft delete by setting status to DELETED
        return this.prisma.product.update({
            where: { id },
            data: { status: ResourceStatus.DELETED },
        });
    }
}
