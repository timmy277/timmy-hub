import {
    IsString,
    IsOptional,
    IsArray,
    IsEnum,
    IsBoolean,
    MaxLength,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    HIDDEN = 'HIDDEN',
}

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    @MaxLength(200)
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    hashtags?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    productIds?: string[];

    @ApiPropertyOptional({ enum: PostStatus })
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;
}

export class UpdatePostDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    hashtags?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    productIds?: string[];

    @ApiPropertyOptional({ enum: PostStatus })
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPinned?: boolean;
}

export class GetPostsDto {
    @ApiPropertyOptional({
        description: 'Cursor = id của post cuối cùng đã fetch (cursor-based pagination)',
    })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiPropertyOptional({ default: 12 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 12;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sellerId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    hashtag?: string;
}
