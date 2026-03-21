import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) {}

    @Get()
    @ApiOperation({ summary: 'Danh sách địa chỉ của user' })
    async list(@CurrentUser() user: User) {
        const data = await this.addressesService.findAllForUser(user.id);
        return { success: true, data };
    }

    @Post()
    @ApiOperation({ summary: 'Thêm địa chỉ' })
    async create(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
        const data = await this.addressesService.create(user.id, dto);
        return { success: true, data, message: 'addresses.created' };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật địa chỉ' })
    async update(
        @CurrentUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateAddressDto,
    ) {
        const data = await this.addressesService.update(user.id, id, dto);
        return { success: true, data, message: 'addresses.updated' };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa địa chỉ' })
    async remove(@CurrentUser() user: User, @Param('id') id: string) {
        await this.addressesService.remove(user.id, id);
        return { success: true, message: 'addresses.deleted' };
    }

    @Post(':id/default')
    @ApiOperation({ summary: 'Đặt làm địa chỉ mặc định' })
    async setDefault(@CurrentUser() user: User, @Param('id') id: string) {
        const data = await this.addressesService.setDefault(user.id, id);
        return { success: true, data, message: 'addresses.defaultSet' };
    }
}
