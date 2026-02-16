import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsArray } from 'class-validator';

/**
 * DTO cho việc tạo sản phẩm mới
 * @author TimmyHub AI
 */
export class CreateProductDto {
    @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Tên sản phẩm' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'iphone-15-pro-max', description: 'Slug duy nhất cho sản phẩm' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ example: 'Siêu phẩm Apple 2023', description: 'Mô tả chi tiết sản phẩm' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 35000000, description: 'Giá bán' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 100, description: 'Số lượng trong kho' })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: 'IP15PM-BLK-256', description: 'Mã kho (SKU)', required: false })
    @IsString()
    @IsOptional()
    sku?: string;

    @ApiProperty({
        example: 'uuid-category-id',
        description: 'ID danh mục sản phẩm',
        required: false,
    })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiProperty({
        example: ['https://example.com/img1.png'],
        description: 'Mảng URL hình ảnh sản phẩm',
        required: false,
    })
    @IsArray()
    @IsOptional()
    images?: string[];
}
