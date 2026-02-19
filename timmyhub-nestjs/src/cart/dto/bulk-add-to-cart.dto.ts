import { IsArray, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { AddToCartDto } from './add-to-cart.dto';

export class BulkAddToCartDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddToCartDto)
    @ArrayMaxSize(20, { message: 'Tối đa 20 sản phẩm một lần' })
    items: AddToCartDto[];
}
