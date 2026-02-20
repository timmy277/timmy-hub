import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVnpayUrlDto {
    @ApiProperty({ description: 'Order ID' })
    @IsString()
    @IsNotEmpty()
    orderId: string;
}
