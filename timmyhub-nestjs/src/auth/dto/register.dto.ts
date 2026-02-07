import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsString } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @ApiProperty({ example: 'User@123' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
    password: string;

    @ApiProperty({ example: 'Nguyễn' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Văn A' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ required: false, example: '0987654321' })
    @IsOptional()
    @IsString()
    phone?: string;
}
