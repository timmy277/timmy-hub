import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({ example: 'MODERATOR' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Điều phối viên' })
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false, default: false })
    @IsBoolean()
    @IsOptional()
    isSystem?: boolean;

    @ApiProperty({ required: false, type: [String], example: ['product.approve', 'post.delete'] })
    @IsOptional()
    permissionNames?: string[];
}
