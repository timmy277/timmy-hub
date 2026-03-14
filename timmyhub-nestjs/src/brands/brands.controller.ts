import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả thương hiệu (Public)' })
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

        const mapped = brands.map(b => ({
            id: b.id,
            name: b.brandName,
            slug: b.brandSlug,
            logo: b.brandLogo,
        }));

        return ResponseDto.success('Lấy danh sách thương hiệu thành công', mapped);
    }
}
