import { Controller, Post, Body, Req, Res, Get, UseGuards, Delete, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResponseDto } from '../common/dto/response.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { UserRequest } from './interfaces/auth.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        return ResponseDto.success('Đăng ký thành công', user);
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập hệ thống' })
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const result = await this.authService.login(dto, ip, userAgent);

        // Set cookies
        const accessMaxAge = this.authService.getAccessCookieMaxAge();
        const refreshMaxAge = this.authService.getRefreshCookieMaxAge();

        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: accessMaxAge,
        });

        res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshMaxAge,
        });

        return ResponseDto.success('Đăng nhập thành công', result);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req.cookies as Record<string, string>)['refresh_token'];
        const result = await this.authService.refreshTokens(refreshToken);

        const accessMaxAge = this.authService.getAccessCookieMaxAge();
        const refreshMaxAge = this.authService.getRefreshCookieMaxAge();

        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: accessMaxAge,
        });

        res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshMaxAge,
        });

        return ResponseDto.success('Làm mới token thành công', result);
    }

    @Delete('logout')
    @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req.cookies as Record<string, string>)['refresh_token'];
        await this.authService.logout(refreshToken);

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

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

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy thông tin profile người dùng hiện tại' })
    async getProfile(@Req() req: UserRequest) {
        const profile = await this.authService.getProfile(req.user.id);
        return ResponseDto.success('Lấy thông tin profile thành công', profile);
    }

    @Post('cleanup-expired-tokens')
    @ApiOperation({
        summary: 'Dọn dẹp refresh tokens đã hết hạn (Cron job hoặc manual)',
        description: 'Xóa tất cả refresh tokens đã expire hoặc bị revoked khỏi database',
    })
    async cleanupExpiredTokens() {
        const deleted = await this.authService.cleanupExpiredTokens();
        return ResponseDto.success('Đã dọn dẹp tokens hết hạn', { deletedCount: deleted });
    }

    @Get('token-statistics')
    @ApiOperation({
        summary: 'Thống kê refresh tokens trong database',
        description: 'Xem số lượng tokens: total, expired, revoked, valid',
    })
    async getTokenStatistics() {
        const stats = await this.authService.getTokenStatistics();
        return ResponseDto.success('Lấy thống kê tokens thành công', stats);
    }
}
