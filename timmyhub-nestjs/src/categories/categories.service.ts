import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateCategoryDto): Promise<Category> {
        // Kiểm tra slug đã tồn tại chưa
        const existing = await this.prisma.category.findUnique({
            where: { slug: dto.slug },
        });

        if (existing) {
            throw new ConflictException('Slug danh mục này đã tồn tại');
        }

        if (dto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new NotFoundException('Danh mục cha không tồn tại');
            }
        }

        return this.prisma.category.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                image: dto.image,
                isActive: dto.isActive ?? true,
                parentId: dto.parentId,
            },
        });
    }

    async findAll(includeInactive = false): Promise<Category[]> {
        return this.prisma.category.findMany({
            where: includeInactive ? {} : { isActive: true },
            include: {
                children: {
                    where: includeInactive ? {} : { isActive: true },
                },
            },
        });
    }

    async findOne(idOrSlug: string): Promise<Category> {
        const category = await this.prisma.category.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
            include: {
                children: true,
                parent: true,
            },
        });

        if (!category) {
            throw new NotFoundException('Không tìm thấy danh mục');
        }

        return category;
    }

    async update(id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) throw new NotFoundException('Không tìm thấy danh mục');

        if (dto.slug && dto.slug !== category.slug) {
            const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
            if (existing) throw new ConflictException('Slug danh mục đã tồn tại');
        }

        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string): Promise<void> {
        const hasChildren = await this.prisma.category.count({
            where: { parentId: id },
        });

        if (hasChildren > 0) {
            throw new BadRequestException('Không thể xóa danh mục đang có danh mục con');
        }

        const hasProducts = await this.prisma.category.count({
            where: { products: { some: { id: { not: undefined } } } },
        });

        if (hasProducts > 0) {
            throw new BadRequestException('Không thể xóa danh mục đang có sản phẩm');
        }

        await this.prisma.category.delete({ where: { id } });
    }
}
