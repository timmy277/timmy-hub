import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchSortBy {
    RELEVANCE = 'relevance',
    NEWEST = 'newest',
    PRICE_ASC = 'price_asc',
    PRICE_DESC = 'price_desc',
    BEST_SELLING = 'best_selling',
    RATING = 'rating',
}

export class SearchProductDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    minRating?: number;

    @ApiPropertyOptional({ enum: SearchSortBy, default: SearchSortBy.RELEVANCE })
    @IsOptional()
    @IsEnum(SearchSortBy)
    sortBy?: SearchSortBy = SearchSortBy.RELEVANCE;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Transform(({ value }) => (value !== undefined ? parseInt(String(value), 10) : 1))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Transform(({ value }) => (value !== undefined ? parseInt(String(value), 10) : 20))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}

export class SuggestDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    q?: string;
}
