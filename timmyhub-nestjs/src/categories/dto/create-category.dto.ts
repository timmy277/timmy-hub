import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Điện thoại & Máy tính bảng', description: 'Tên danh mục' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'dien-thoai-may-tinh-bang', description: 'Slug duy nhất cho danh mục' })
    @IsString()
    slug: string;

    @ApiProperty({
        example: 'uuid-parent-category',
        description: 'ID danh mục cha (nếu có)',
        required: false,
    })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiProperty({
        example: 'https://example.com/icon.png',
        description: 'URL icon danh mục',
        required: false,
    })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiProperty({
        example: 'Danh mục các thiết bị di động',
        description: 'Mô tả danh mục',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: true, description: 'Trạng thái hoạt động', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
