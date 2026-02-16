import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ResourceStatus, Product } from '@prisma/client';

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
            },
        });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
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
}
