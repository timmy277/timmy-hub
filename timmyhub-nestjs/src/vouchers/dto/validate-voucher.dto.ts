import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class ValidateVoucherDto {
    @ApiProperty({ description: 'Mã voucher' })
    @IsString()
    code: string;

    @ApiPropertyOptional({ enum: PaymentMethod, description: 'Phương thức thanh toán' })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;
}
