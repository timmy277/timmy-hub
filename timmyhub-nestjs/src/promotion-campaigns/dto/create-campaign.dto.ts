import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean, IsIn, ValidateIf } from 'class-validator';

export class CreatePromotionCampaignDto {
    @ApiProperty({ example: 'Khuyến mãi tháng 3' })
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 'VOUCHER_CAMPAIGN',
        description: 'VOUCHER_CAMPAIGN | FLASH_SALE | CATEGORY_SALE | EVENT',
    })
    @IsString()
    type: string;

    @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ example: '2026-03-31T23:59:59.000Z' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    /** Chỉ Admin: PLATFORM | SELLER */
    @ApiPropertyOptional({ description: 'Admin: ownerType (PLATFORM | SELLER)' })
    @IsOptional()
    @IsIn(['PLATFORM', 'SELLER'])
    ownerType?: 'PLATFORM' | 'SELLER';

    /** Chỉ Admin: ownerId (null khi PLATFORM, userId seller khi SELLER) */
    @ApiPropertyOptional({ description: 'Admin: ownerId (bắt buộc nếu ownerType=SELLER)' })
    @IsOptional()
    @ValidateIf((_, v) => v != null)
    @IsString()
    ownerId?: string | null;
}
