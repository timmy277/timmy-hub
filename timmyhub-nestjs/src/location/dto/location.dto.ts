import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProvinceDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;
}

export class DistrictDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    provinceCode: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;
}

export class WardDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    districtCode: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;
}

// ===== Admin CRUD DTOs =====

export class CreateProvinceDto {
    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;
}

export class CreateDistrictDto {
    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    provinceCode: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;
}

export class CreateWardDto {
    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    districtCode: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    slug: string;
}

export class UpdateProvinceDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    slug?: string;
}

export class UpdateDistrictDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    slug?: string;
}

export class UpdateWardDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    slug?: string;
}

// ===== Seed DTOs (bulk import) =====

export class BulkSeedLocationDto {
    @ApiProperty({ type: [CreateProvinceDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProvinceDto)
    provinces: CreateProvinceDto[];

    @ApiProperty({ type: [CreateDistrictDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateDistrictDto)
    districts: CreateDistrictDto[];

    @ApiProperty({ type: [CreateWardDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateWardDto)
    wards: CreateWardDto[];
}
