import {
    Controller,
    Post,
    Body,
    Req,
    Get,
    UseGuards,
    Delete,
    Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResponseDto } from '../common/dto/response.dto';
import * as express from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { UserRequest } from './interfaces/auth.interface';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        return ResponseDto.success('Đăng ký thành công', user);
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập hệ thống' })
    async login(@Body() dto: LoginDto, @Req() req: express.Request) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const result = await this.authService.login(dto, ip, userAgent);
        return ResponseDto.success('Đăng nhập thành công', result);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
    async refresh(@Body('refreshToken') refreshToken: string) {
        const result = await this.authService.refreshTokens(refreshToken);
        return ResponseDto.success('Làm mới token thành công', result);
    }

    @Delete('logout')
    @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
    async logout(@Body('refreshToken') refreshToken: string) {
        await this.authService.logout(refreshToken);
        return ResponseDto.success('Đăng xuất thành công');
    }

    @Get('devices')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy danh sách thiết bị đang đăng nhập' })
    async getDevices(@Req() req: UserRequest) {
        const userId = req.user.id;
        const devices = await this.authService.getDevices(userId);
        return ResponseDto.success('Lấy danh sách thiết bị thành công', devices);
    }

    @Delete('devices/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Đăng xuất từ xa một thiết bị' })
    async logoutDevice(@Param('id') deviceId: string, @Req() req: UserRequest) {
        const userId = req.user.id;
        await this.authService.logoutDevice(userId, deviceId);
        return ResponseDto.success('Đã đăng xuất thiết bị');
    }
}

