import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BrandsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        const brands = await this.prisma.brandProfile.findMany({
            where: { isVerified: true },
            select: {
                id: true,
                brandName: true,
                brandSlug: true,
                brandLogo: true,
            },
            orderBy: { brandName: 'asc' },
        });

        return brands.map(b => ({
            id: b.id,
            name: b.brandName,
            slug: b.brandSlug,
            logo: b.brandLogo,
        }));
    }
}
