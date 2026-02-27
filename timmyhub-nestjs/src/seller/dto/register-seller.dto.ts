import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterSellerDto {
    @ApiProperty({ example: 'Shop ABC', description: 'Tên gian hàng' })
    @IsString()
    @MinLength(2, { message: 'Tên gian hàng tối thiểu 2 ký tự' })
    @MaxLength(100)
    shopName: string;

    @ApiProperty({
        example: 'shop-abc',
        description: 'Slug URL (chỉ chữ thường, số, dấu gạch ngang)',
    })
    @IsString()
    @MinLength(2)
    @MaxLength(60)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
    })
    shopSlug: string;

    @ApiPropertyOptional({ description: 'Mô tả gian hàng' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
