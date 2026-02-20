import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderFromCartDto {
    @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.VNPAY })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod = PaymentMethod.VNPAY;
}
