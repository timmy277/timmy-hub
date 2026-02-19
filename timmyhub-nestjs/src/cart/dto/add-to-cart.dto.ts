import { IsString, IsInt, Min, Max } from 'class-validator';

export class AddToCartDto {
    @IsString()
    productId: string;

    @IsInt()
    @Min(1, { message: 'Số lượng phải lớn hơn 0' })
    @Max(99, { message: 'Số lượng tối đa là 99' })
    quantity: number;
}
