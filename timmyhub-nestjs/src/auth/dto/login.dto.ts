import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@timmyhub.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({ example: 'Admin@123' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
    password: string;

    @ApiProperty({ required: false, example: 'My Laptop' })
    @IsString()
    @IsOptional()
    deviceName?: string;

    @ApiProperty({ required: false, example: true })
    @IsOptional()
    remember?: boolean;
}
