import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VNPay, dateFormat, VnpLocale, HashAlgorithm } from 'vnpay';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface VnpayReturnParams {
    vnp_Amount: string;
    vnp_BankCode?: string;
    vnp_BankTranNo?: string;
    vnp_CardType?: string;
    vnp_OrderInfo?: string;
    vnp_PayDate?: string;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;
    vnp_TransactionNo?: string;
    vnp_TransactionStatus?: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
    vnp_SecureHashType?: string;
    [key: string]: string | undefined;
}

@Injectable()
export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);
    private readonly vnpay: VNPay;
    private readonly returnUrl: string;
    private readonly ipnUrl: string;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const tmnCode = this.config.get<string>('VNPAY_TMN_CODE') ?? '';
        const secureSecret = this.config.get<string>('VNPAY_HASH_SECRET') ?? '';
        const fullUrl =
            this.config.get<string>('VNPAY_URL') ??
            'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const vnpayHost = fullUrl.startsWith('http') ? new URL(fullUrl).origin : fullUrl;

        this.vnpay = new VNPay({
            tmnCode,
            secureSecret,
            vnpayHost,
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
        });

        this.returnUrl =
            this.config.get<string>('VNPAY_RETURN_URL') ??
            'http://localhost:3001/api/payments/vnpay/return';
        this.ipnUrl =
            this.config.get<string>('VNPAY_IPN_URL') ??
            'http://localhost:3001/api/payments/vnpay/ipn';
    }

    private getClientIp(req: {
        ip?: string;
        headers?: Record<string, string | string[] | undefined>;
    }): string {
        const forwarded = req.headers?.['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        if (Array.isArray(forwarded) && forwarded[0]) {
            return String(forwarded[0]).trim();
        }
        return req.ip ?? '127.0.0.1';
    }

    async createPaymentUrl(
        orderId: string,
        userId: string,
        req: { ip?: string; headers?: Record<string, string | string[] | undefined> },
    ): Promise<{ url: string; paymentId: string }> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { payment: true },
        });

        if (!order) {
            throw new BadRequestException('Đơn hàng không tồn tại');
        }

        if (order.paymentStatus === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Đơn hàng đã thanh toán');
        }

        const amountVnd = Math.round(Number(order.totalAmount));

        let payment = order.payment;
        if (!payment || payment.status === PaymentStatus.FAILED) {
            const txnRef =
                payment?.vnpayTxnRef ?? `TH${orderId.slice(-8)}${Date.now().toString(36)}`;
            payment = await this.prisma.payment.upsert({
                where: { orderId },
                create: {
                    orderId,
                    method: 'VNPAY',
                    status: PaymentStatus.PENDING,
                    amount: order.totalAmount,
                    vnpayTxnRef: txnRef,
                },
                update: { status: PaymentStatus.PENDING },
            });
        }

        const createDate = new Date();
        const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000);
        const ipAddr = this.getClientIp(req);
        // OrderInfo: tieng Viet khong dau, khong ky tu dac biet (theo tai lieu VNPay)
        const orderInfo = `Thanh toan don hang TimmyHub ${orderId}`;

        const url = this.vnpay.buildPaymentUrl({
            vnp_Amount: amountVnd,
            vnp_IpAddr: ipAddr,
            vnp_ReturnUrl: this.returnUrl,
            vnp_TxnRef: payment.vnpayTxnRef!,
            vnp_OrderInfo: orderInfo,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(createDate),
            vnp_ExpireDate: dateFormat(expireDate),
        });

        this.logger.log(`VNPay URL created for order ${orderId}`);
        return { url, paymentId: payment.id };
    }

    verifyReturnQuery(query: Record<string, string>): boolean {
        const result = this.vnpay.verifyReturnUrl(query as never);
        return result.isVerified;
    }

    async processReturn(query: VnpayReturnParams): Promise<{
        success: boolean;
        orderId?: string;
        message: string;
        code?: string;
    }> {
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(query)) {
            if (v !== undefined && v !== '') params[k] = String(v);
        }

        if (!this.verifyReturnQuery(params)) {
            return { success: false, message: 'Invalid signature' };
        }

        const responseCode = query.vnp_ResponseCode;
        const txnRef = query.vnp_TxnRef;

        if (responseCode !== '00') {
            this.logger.warn(`VNPay return failed: ${responseCode} txnRef=${txnRef}`);
            const payment = await this.prisma.payment.findUnique({
                where: { vnpayTxnRef: txnRef },
                include: { order: true },
            });
            if (payment) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.FAILED },
                });
            }
            return {
                success: false,
                orderId: payment?.orderId,
                message: 'Thanh toán thất bại hoặc bị hủy',
                code: responseCode,
            };
        }

        const payment = await this.prisma.payment.findUnique({
            where: { vnpayTxnRef: txnRef },
            include: { order: true },
        });

        if (!payment) {
            return { success: false, message: 'Payment not found' };
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            return {
                success: true,
                orderId: payment.orderId,
                message: 'Đã thanh toán thành công',
            };
        }

        await this.prisma.$transaction(async tx => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.COMPLETED,
                    vnpayTransNo: query.vnp_TransactionNo ?? undefined,
                    paidAt: new Date(),
                    metadata: query as unknown as object,
                },
            });
            await tx.order.update({
                where: { id: payment.orderId },
                data: {
                    paymentStatus: PaymentStatus.COMPLETED,
                    status: OrderStatus.CONFIRMED,
                },
            });
        });

        this.logger.log(`VNPay payment completed: order ${payment.orderId}`);
        return {
            success: true,
            orderId: payment.orderId,
            message: 'Thanh toán thành công',
        };
    }

    async processIpn(query: VnpayReturnParams): Promise<{ RspCode: number; Message: string }> {
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(query)) {
            if (v !== undefined && v !== '') params[k] = String(v);
        }

        const result = this.vnpay.verifyIpnCall(params as never);
        if (!result.isVerified) {
            this.logger.warn('VNPay IPN invalid signature');
            return { RspCode: 97, Message: 'Invalid signature' };
        }

        const responseCode = query.vnp_ResponseCode;
        const txnRef = query.vnp_TxnRef;

        if (responseCode !== '00') {
            const payment = await this.prisma.payment.findUnique({
                where: { vnpayTxnRef: txnRef },
            });
            if (payment && payment.status !== PaymentStatus.COMPLETED) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.FAILED },
                });
            }
            return { RspCode: 0, Message: 'Confirm success' };
        }

        const payment = await this.prisma.payment.findUnique({
            where: { vnpayTxnRef: txnRef },
        });

        if (!payment) {
            return { RspCode: 99, Message: 'Order not found' };
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            return { RspCode: 0, Message: 'Confirm success' };
        }

        await this.prisma.$transaction(async tx => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.COMPLETED,
                    vnpayTransNo: query.vnp_TransactionNo ?? undefined,
                    paidAt: new Date(),
                    metadata: query as unknown as object,
                },
            });
            await tx.order.update({
                where: { id: payment.orderId },
                data: {
                    paymentStatus: PaymentStatus.COMPLETED,
                    status: OrderStatus.CONFIRMED,
                },
            });
        });

        this.logger.log(`VNPay IPN processed: order ${payment.orderId}`);
        return { RspCode: 0, Message: 'Confirm success' };
    }
}
