import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả thương hiệu (Public)' })
    async findAll() {
        const brands = await this.brandsService.findAll();
        return ResponseDto.success('Lấy danh sách thương hiệu thành công', brands);
    }
}
