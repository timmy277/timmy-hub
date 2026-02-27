import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderFromCartDto {
    @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.VNPAY })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod = PaymentMethod.VNPAY;

    @ApiPropertyOptional({ description: 'Mã voucher áp dụng cho đơn' })
    @IsOptional()
    @IsString()
    voucherCode?: string;
}
