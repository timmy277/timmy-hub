import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'iPhone 15 Pro Max' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Siêu phẩm Apple 2023' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 35000000 })
    @IsNumber()
    @Min(0)
    price: number;
}
