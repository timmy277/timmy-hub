import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import {
    VNPAY_VERSION,
    VNPAY_COMMAND,
    VNPAY_CURRENCY,
    VNPAY_LOCALE_VN,
    VNPAY_ORDER_TYPE,
} from './constants/vnpay.constants';

const VNPAY_HASH_ALGORITHM = 'sha512';

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
    private readonly tmnCode: string;
    private readonly hashSecret: string;
    private readonly baseUrl: string;
    private readonly returnUrl: string;
    private readonly ipnUrl: string;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.tmnCode = this.config.get<string>('VNPAY_TMN_CODE') ?? '';
        this.hashSecret = this.config.get<string>('VNPAY_HASH_SECRET') ?? '';
        this.baseUrl =
            this.config.get<string>('VNPAY_URL') ??
            'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        this.returnUrl =
            this.config.get<string>('VNPAY_RETURN_URL') ??
            'http://localhost:3001/api/payments/vnpay/return';
        this.ipnUrl =
            this.config.get<string>('VNPAY_IPN_URL') ?? 'http://localhost:3001/api/payments/vnpay/ipn';
    }

    private signParams(params: Record<string, string>): string {
        const sortedKeys = Object.keys(params).sort();
        const signData = sortedKeys
            .filter((k) => params[k] !== '' && params[k] !== undefined)
            .map((k) => `${k}=${params[k]}`)
            .join('&');
        return createHmac(VNPAY_HASH_ALGORITHM, this.hashSecret)
            .update(Buffer.from(signData, 'utf8'))
            .digest('hex');
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
        const amountVnpay = amountVnd * 100;

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
        const vnpCreateDate = [
            createDate.getFullYear(),
            String(createDate.getMonth() + 1).padStart(2, '0'),
            String(createDate.getDate()).padStart(2, '0'),
            String(createDate.getHours()).padStart(2, '0'),
            String(createDate.getMinutes()).padStart(2, '0'),
            String(createDate.getSeconds()).padStart(2, '0'),
        ]
            .join('')
            .slice(0, 14);

        const ipAddr = this.getClientIp(req);
        const params: Record<string, string> = {
            vnp_Version: VNPAY_VERSION,
            vnp_Command: VNPAY_COMMAND,
            vnp_TmnCode: this.tmnCode,
            vnp_Amount: String(amountVnpay),
            vnp_CurrCode: VNPAY_CURRENCY,
            vnp_TxnRef: payment.vnpayTxnRef!,
            vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
            vnp_OrderType: VNPAY_ORDER_TYPE,
            vnp_Locale: VNPAY_LOCALE_VN,
            vnp_ReturnUrl: this.returnUrl,
            vnp_IpnUrl: this.ipnUrl,
            vnp_CreateDate: vnpCreateDate,
            vnp_IpAddr: ipAddr,
        };

        const secureHash = this.signParams(params);
        params.vnp_SecureHashType = 'HMACSHA512';
        params.vnp_SecureHash = secureHash;

        const query = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}?${query}`;

        this.logger.log(`VNPay URL created for order ${orderId}`);
        return { url, paymentId: payment.id };
    }

    verifyReturnQuery(query: Record<string, string>): boolean {
        const secureHash = query.vnp_SecureHash;
        const secureHashType = query.vnp_SecureHashType;
        if (!secureHash) return false;

        const filtered: Record<string, string> = {};
        for (const [k, v] of Object.entries(query)) {
            if (k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType' && v !== '') {
                filtered[k] = v;
            }
        }
        const expectedHash = this.signParams(filtered);
        return secureHashType === 'HMACSHA512' && secureHash === expectedHash;
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

        await this.prisma.$transaction(async (tx) => {
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

        if (!this.verifyReturnQuery(params)) {
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

        await this.prisma.$transaction(async (tx) => {
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
