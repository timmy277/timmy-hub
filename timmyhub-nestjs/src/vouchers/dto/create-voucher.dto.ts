import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsArray,
    IsDateString,
    Min,
    ValidateIf,
} from 'class-validator';
import { VoucherType } from '@prisma/client';

export class CreateVoucherDto {
    @ApiProperty({ example: 'SALE20', description: 'Mã voucher (unique)' })
    @IsString()
    code: string;

    @ApiProperty({ enum: VoucherType })
    @IsEnum(VoucherType)
    type: VoucherType;

    @ApiProperty({ example: 20, description: 'Phần trăm hoặc số tiền (VND), freeship thường 0' })
    @IsNumber()
    @Min(0)
    value: number;

    @ApiPropertyOptional({ example: 100000, description: 'Đơn tối thiểu (VND)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;

    @ApiPropertyOptional({ example: 50000, description: 'Giảm tối đa (VND) cho PERCENTAGE' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxDiscount?: number;

    @ApiPropertyOptional({ example: 100, description: 'Tổng số lần dùng (null = không giới hạn)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    usageLimit?: number;

    @ApiPropertyOptional({ example: 1, description: 'Số lần dùng tối đa mỗi user' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    perUserLimit?: number;

    @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-03-31T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: ['cat1', 'cat2'], description: 'Áp dụng cho category' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoryIds?: string[];

    @ApiPropertyOptional({ example: ['prod1', 'prod2'], description: 'Áp dụng cho sản phẩm' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    productIds?: string[];

    @ApiPropertyOptional({
        example: ['VNPAY', 'COD'],
        description: 'Phương thức thanh toán áp dụng',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    paymentMethods?: string[];

    @ApiPropertyOptional({ description: 'ID chương trình khuyến mãi (campaign của shop)' })
    @IsOptional()
    @IsString()
    campaignId?: string;

    /** Chỉ Admin: null = voucher sàn, string = voucher của seller đó */
    @ApiPropertyOptional({ description: 'Admin: sellerId (null = voucher sàn)' })
    @IsOptional()
    @ValidateIf((_, v) => v != null)
    @IsString()
    sellerId?: string | null;
}
