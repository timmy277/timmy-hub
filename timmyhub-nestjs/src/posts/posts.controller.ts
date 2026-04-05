import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, GetPostsDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

class AddCommentDto {
    @ApiProperty()
    @IsString()
    @MaxLength(1000)
    content: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId?: string;
}

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Get()
    @Public()
    @ApiOperation({ summary: 'Feed video/post công khai' })
    getFeed(@Query() dto: GetPostsDto) {
        return this.postsService.getFeed(dto);
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Posts của seller đang đăng nhập' })
    getMyPosts(@CurrentUser() user: { id: string }, @Query() dto: GetPostsDto) {
        return this.postsService.getMyPosts(user.id, dto);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Chi tiết post' })
    findOne(@Param('id') id: string) {
        return this.postsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo post/video quảng cáo (Seller)' })
    create(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
        return this.postsService.create(user.id, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật post (Seller)' })
    update(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() dto: UpdatePostDto,
    ) {
        return this.postsService.update(id, user.id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xóa post (Seller/Admin)' })
    delete(@Param('id') id: string, @CurrentUser() user: { id: string; roles: string[] }) {
        return this.postsService.delete(id, user.id, user.roles as never);
    }

    @Post(':id/like')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Like / Unlike post' })
    toggleLike(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        return this.postsService.toggleLike(id, user.id);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Thêm comment' })
    addComment(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() dto: AddCommentDto,
    ) {
        return this.postsService.addComment(id, user.id, dto.content, dto.parentId);
    }

    @Get(':id/comments')
    @Public()
    @ApiOperation({ summary: 'Lấy comments của post' })
    getComments(@Param('id') id: string) {
        return this.postsService.getComments(id);
    }
}
