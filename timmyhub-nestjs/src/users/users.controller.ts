import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Permissions('users:create')
    @ApiOperation({ summary: 'Tạo người dùng mới' })
    async createUser(@Body() dto: CreateUserDto) {
        const user = await this.usersService.create(dto);
        return ResponseDto.success('Tạo người dùng thành công', user);
    }

    @Get()

    @Permissions('users:read')
    @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
    async getUsers() {
        const users = await this.usersService.findAll();
        return ResponseDto.success('Lấy danh sách người dùng thành công', users);
    }

    @Get(':id')
    @Permissions('users:read')
    @ApiOperation({ summary: 'Lấy chi tiết người dùng' })
    async getUser(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        return ResponseDto.success('Lấy chi tiết người dùng thành công', user);
    }

    @Post(':id/roles')
    @Permissions('users:update')
    @ApiOperation({ summary: 'Gán vai trò hệ thống cho người dùng' })
    async assignRoles(
        @Param('id') id: string,
        @Body('roleNames') roleNames: string[],
    ) {
        await this.usersService.assignRoles(id, roleNames);
        return ResponseDto.success('Gán vai trò thành công');
    }

    @Patch(':id/toggle-status')
    @Permissions('users:update')
    @ApiOperation({ summary: 'Kích hoạt/Khóa tài khoản người dùng' })
    async toggleStatus(@Param('id') id: string) {
        const user = await this.usersService.toggleActive(id);
        return ResponseDto.success(
            `Đã ${user.isActive ? 'kích hoạt' : 'khóa'} tài khoản thành công`,
        );
    }

    @Patch(':id')
    @Permissions('users:update')
    @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        const user = await this.usersService.update(id, dto);
        return ResponseDto.success('Cập nhật người dùng thành công', user);
    }
}
