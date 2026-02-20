import { Controller, Post, Get, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { VnpayService, VnpayReturnParams } from './vnpay.service';
import { CreateVnpayUrlDto } from './dto/create-vnpay-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import type { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    private readonly frontendUrl: string;

    constructor(
        private readonly vnpayService: VnpayService,
        private readonly config: ConfigService,
    ) {
        this.frontendUrl =
            this.config.get<string>('FRONTEND_URL')?.split(',')[0]?.trim() ??
            'http://localhost:3000';
    }

    @Post('vnpay/create-url')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo URL thanh toán VNPay cho đơn hàng' })
    async createVnpayUrl(
        @CurrentUser() user: User,
        @Body() dto: CreateVnpayUrlDto,
        @Req() req: Request,
    ) {
        const { url, paymentId } = await this.vnpayService.createPaymentUrl(dto.orderId, user.id, {
            ip: req.ip,
            headers: req.headers as Record<string, string | string[] | undefined>,
        });
        return ResponseDto.success('Tạo link thanh toán thành công', {
            url,
            paymentId,
            orderId: dto.orderId,
        });
    }

    @Get('vnpay/return')
    @ApiOperation({ summary: 'VNPay redirect return URL (sau khi user thanh toán)' })
    async vnpayReturn(@Req() req: Request, @Res() res: Response) {
        const query = req.query as unknown as VnpayReturnParams & Record<string, string>;
        const result = await this.vnpayService.processReturn(query);
        const redirectUrl = new URL('/payment/result', this.frontendUrl);
        redirectUrl.searchParams.set('success', String(result.success));
        redirectUrl.searchParams.set('message', result.message);
        if (result.orderId) {
            redirectUrl.searchParams.set('orderId', result.orderId);
        }
        if (result.code) {
            redirectUrl.searchParams.set('code', result.code);
        }
        res.redirect(302, redirectUrl.toString());
    }

    @Post('vnpay/ipn')
    @ApiOperation({ summary: 'VNPay IPN callback (server-to-server)' })
    async vnpayIpn(@Body() body: VnpayReturnParams & Record<string, string>, @Res() res: Response) {
        const result = await this.vnpayService.processIpn(body);
        res.status(200).json(result);
    }
}
