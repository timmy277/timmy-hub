import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({ example: 'Nguyen', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({ example: 'Van A', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({ example: 'Nguyen Van A', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    displayName?: string;

    @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
    @IsOptional()
    @IsString()
    avatar?: string;
}
