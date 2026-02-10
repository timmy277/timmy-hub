import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty({ example: 'users:read', description: 'Tên định danh của quyền' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'Xem danh sách người dùng', description: 'Tên hiển thị' })
    @IsNotEmpty()
    @IsString()
    displayName: string;

    @ApiProperty({ example: 'Cho phép xem danh sách người dùng', description: 'Mô tả chi tiết' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'users', description: 'Module chứa quyền' })
    @IsNotEmpty()
    @IsString()
    module: string;

    @ApiProperty({ example: 'read', description: 'Hành động của quyền' })
    @IsNotEmpty()
    @IsString()
    action: string;
}

export class UpdatePermissionDto {
    @ApiProperty({ example: 'Xem danh sách người dùng', description: 'Tên hiển thị' })
    @IsOptional()
    @IsString()
    displayName?: string;

    @ApiProperty({ example: 'Cho phép xem danh sách người dùng', description: 'Mô tả chi tiết' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'users', description: 'Module chứa quyền' })
    @IsOptional()
    @IsString()
    module?: string;

    @ApiProperty({ example: 'read', description: 'Hành động của quyền' })
    @IsOptional()
    @IsString()
    action?: string;
}
