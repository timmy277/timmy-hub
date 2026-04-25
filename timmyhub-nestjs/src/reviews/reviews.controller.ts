import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UseGuards,
    Req,
    Patch,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ReviewsGateway } from './reviews.gateway';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseDto } from '../common/dto/response.dto';
import type { UserRequest, OptionalUserRequest } from '../auth/interfaces/auth.interface';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(
        private readonly reviewsService: ReviewsService,
        private readonly reviewsGateway: ReviewsGateway,
        private readonly prisma: PrismaService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo review sau khi đơn hàng được giao' })
    async create(@Req() req: UserRequest, @Body() dto: CreateReviewDto) {
        const review = await this.reviewsService.create(req.user.id, dto);

        this.reviewsGateway.emitNewReview(dto.productId, review);

        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            select: { ratingAvg: true, ratingCount: true },
        });
        if (product) {
            this.reviewsGateway.emitRatingUpdated(dto.productId, {
                ratingAvg: product.ratingAvg,
                ratingCount: product.ratingCount,
            });
        }

        return ResponseDto.success('Đánh giá thành công', review);
    }

    @Get('product/:productId')
    @Public()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Lấy danh sách review của sản phẩm' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'rating', required: false, type: Number })
    @ApiQuery({
        name: 'sort',
        required: false,
        enum: ['newest', 'oldest', 'highest', 'lowest', 'helpful'],
    })
    async findByProduct(
        @Param('productId') productId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Req() req: OptionalUserRequest,
        @Query('rating') rating?: string,
        @Query('sort') sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful',
    ) {
        const result = await this.reviewsService.findByProduct(productId, {
            page,
            limit,
            rating: rating ? parseInt(rating, 10) : undefined,
            sort,
            currentUserId: req.user?.id,
        });
        return ResponseDto.success('Lấy danh sách review thành công', result);
    }

    @Get('can-review')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Kiểm tra user có thể review orderItem này không' })
    async canReview(@Req() req: UserRequest, @Query('orderItemId') orderItemId: string) {
        const result = await this.reviewsService.canReview(req.user.id, orderItemId);
        return ResponseDto.success('OK', result);
    }

    @Patch(':id/helpful')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle helpful vote (yêu cầu đăng nhập)' })
    async toggleHelpful(@Param('id') id: string, @Req() req: UserRequest) {
        const result = await this.reviewsService.toggleHelpful(id, req.user.id);
        return ResponseDto.success(result.voted ? 'Đã vote hữu ích' : 'Đã bỏ vote', result);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thêm bình luận vào review' })
    async addComment(
        @Param('id') id: string,
        @Req() req: UserRequest,
        @Body('content') content: string,
        @Body('parentId') parentId?: string,
    ) {
        if (!content || !content.trim()) {
            return ResponseDto.error('Nội dung bình luận không được để trống');
        }
        const comment = await this.reviewsService.addComment(
            id,
            req.user.id,
            content.trim(),
            parentId,
        );

        const review = await this.prisma.review.findUnique({
            where: { id },
            select: { productId: true },
        });
        if (review) {
            this.reviewsGateway.emitNewComment(review.productId, id, comment);
        }

        return ResponseDto.success('Bình luận thành công', comment);
    }
}
