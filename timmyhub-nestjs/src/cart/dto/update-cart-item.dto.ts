import { IsInt, Min, Max } from 'class-validator';

export class UpdateCartItemDto {
    @IsInt()
    @Min(0, { message: 'Số lượng phải >= 0 (0 để xóa)' })
    @Max(99, { message: 'Số lượng tối đa là 99' })
    quantity: number;
}
