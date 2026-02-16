import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    SELLER = 'SELLER',
    BRAND = 'BRAND',
    SHIPPER = 'SHIPPER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @ApiProperty({ example: 'Nguyen' })
    @IsString()
    @IsNotEmpty({ message: 'Họ không được để trống' })
    firstName: string;

    @ApiProperty({ example: 'Van A' })
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    lastName: string;

    @ApiProperty({ example: 'CUSTOMER' })
    @IsString()
    @IsOptional()
    role?: string;

    @ApiProperty({ example: '0123456789' })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ type: [String], example: ['ADMIN'] })
    @IsString({ each: true })
    @IsOptional()
    roleNames?: string[];

    @ApiProperty({ example: 'https://example.com/avatar.png' })
    @IsString()
    @IsOptional()
    avatar?: string;
}
