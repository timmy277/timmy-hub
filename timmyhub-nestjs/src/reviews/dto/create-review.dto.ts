/** DTO tạo review cho sản phẩm sau khi mua hàng thành công */
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateReviewSchema = z.object({
    productId: z.string().min(1, 'productId là bắt buộc'),
    orderItemId: z.string().min(1, 'orderItemId là bắt buộc'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
    images: z.array(z.string().url()).max(5).optional().default([]),
    videos: z.array(z.string().url()).max(2).optional().default([]),
});

export class CreateReviewDto extends createZodDto(CreateReviewSchema) {}
