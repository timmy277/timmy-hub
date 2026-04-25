import {
    Controller,
    Post,
    Body,
    Req,
    Res,
    Get,
    UseGuards,
    Delete,
    Param,
    Patch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseDto } from '../common/dto/response.dto';
import type { Request, Response } from 'express';
import type { CookieOptions } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { UserRequest } from './interfaces/auth.interface';

interface OAuthRequest extends Request {
    user: { id: string; email: string };
}

function getCookieOptions(configService: ConfigService, maxAge: number): CookieOptions {
    const crossSite =
        configService.get<string>('COOKIE_SAME_SITE_NONE') === 'true' ||
        configService.get<string>('COOKIE_CROSS_SITE') === 'true';
    return {
        httpOnly: true,
        secure: crossSite || process.env.NODE_ENV === 'production',
        sameSite: crossSite ? ('none' as const) : ('lax' as const),
        maxAge,
    };
}

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

        const accessMaxAge = this.authService.getAccessCookieMaxAge();
        const refreshMaxAge = this.authService.getRefreshCookieMaxAge();
        res.cookie(
            'access_token',
            result.accessToken,
            getCookieOptions(this.configService, accessMaxAge),
        );
        res.cookie(
            'refresh_token',
            result.refreshToken,
            getCookieOptions(this.configService, refreshMaxAge),
        );
        return ResponseDto.success('Đăng nhập thành công', result);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req.cookies as Record<string, string>)['refresh_token'];
        const result = await this.authService.refreshTokens(refreshToken);

        const accessMaxAge = this.authService.getAccessCookieMaxAge();
        const refreshMaxAge = this.authService.getRefreshCookieMaxAge();
        res.cookie(
            'access_token',
            result.accessToken,
            getCookieOptions(this.configService, accessMaxAge),
        );
        res.cookie(
            'refresh_token',
            result.refreshToken,
            getCookieOptions(this.configService, refreshMaxAge),
        );
        return ResponseDto.success('Làm mới token thành công', result);
    }

    @Delete('logout')
    @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = (req.cookies as Record<string, string>)['refresh_token'];
        await this.authService.logout(refreshToken);

        const opts = getCookieOptions(this.configService, 0);
        res.clearCookie('access_token', { path: '/', ...opts });
        res.clearCookie('refresh_token', { path: '/', ...opts });

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

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật profile người dùng hiện tại' })
    async updateProfile(@Req() req: UserRequest, @Body() dto: UpdateProfileDto) {
        const profile = await this.authService.updateProfile(req.user.id, dto);
        return ResponseDto.success('Cập nhật profile thành công', profile);
    }

    // =========================================================
    // OAuth - Google
    // =========================================================

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Đăng nhập bằng Google (redirect to Google)' })
    async googleLogin(): Promise<void> {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google OAuth callback' })
    async googleCallback(@Req() req: OAuthRequest, @Res() res: Response): Promise<void> {
        return this.handleOAuthCallback(req, res);
    }

    // =========================================================
    // OAuth - Facebook
    // =========================================================

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    @ApiOperation({ summary: 'Đăng nhập bằng Facebook (redirect to Facebook)' })
    async facebookLogin(): Promise<void> {}

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    @ApiOperation({ summary: 'Facebook OAuth callback' })
    async facebookCallback(@Req() req: OAuthRequest, @Res() res: Response): Promise<void> {
        return this.handleOAuthCallback(req, res);
    }

    private async handleOAuthCallback(req: OAuthRequest, res: Response): Promise<void> {
        const user = req.user;
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        const { accessToken, refreshToken } = await this.authService.issueSession(
            user.id,
            ip,
            userAgent,
        );

        const accessMaxAge = this.authService.getAccessCookieMaxAge();
        const refreshMaxAge = this.authService.getRefreshCookieMaxAge();

        res.cookie('access_token', accessToken, getCookieOptions(this.configService, accessMaxAge));
        res.cookie(
            'refresh_token',
            refreshToken,
            getCookieOptions(this.configService, refreshMaxAge),
        );

        const rawFrontendUrl =
            this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
        const frontendUrl = rawFrontendUrl.split(',')[0].trim();
        res.redirect(`${frontendUrl}/api/auth/callback?at=${accessToken}&rt=${refreshToken}`);
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
