import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OrderStatus, ResourceStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(private readonly prisma: PrismaService) {}

    async getOverview(rangeDays = 30): Promise<{
        totalRevenue: number;
        totalOrders: number;
        totalUsers: number;
        totalProducts: number;
        newUsers: number;
        newOrders: number;
        revenueChange: number;
        ordersChange: number;
        usersChange: number;
        productsChange: number;
    }> {
        const now = new Date();
        const startCurrent = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
        const startPrevious = new Date(startCurrent.getTime() - rangeDays * 24 * 60 * 60 * 1000);

        const [currentRevenue, currentOrders, currentUsers, currentProducts] = await Promise.all([
            this.prisma.order.aggregate({
                where: { createdAt: { gte: startCurrent }, paymentStatus: PaymentStatus.COMPLETED },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.count({ where: { createdAt: { gte: startCurrent } } }),
            this.prisma.user.count({ where: { createdAt: { gte: startCurrent } } }),
            this.prisma.product.count({
                where: { status: ResourceStatus.APPROVED, createdAt: { gte: startCurrent } },
            }),
        ]);

        const [prevRevenue, prevOrders, prevUsers, prevProducts] = await Promise.all([
            this.prisma.order.aggregate({
                where: {
                    createdAt: { gte: startPrevious, lt: startCurrent },
                    paymentStatus: PaymentStatus.COMPLETED,
                },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.count({
                where: { createdAt: { gte: startPrevious, lt: startCurrent } },
            }),
            this.prisma.user.count({
                where: { createdAt: { gte: startPrevious, lt: startCurrent } },
            }),
            this.prisma.product.count({
                where: {
                    status: ResourceStatus.APPROVED,
                    createdAt: { gte: startPrevious, lt: startCurrent },
                },
            }),
        ]);

        const [totalUsers, totalProducts] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.product.count({ where: { status: ResourceStatus.APPROVED } }),
        ]);

        const totalRevenue = Number(currentRevenue._sum.totalAmount ?? 0);
        const prevRevenueVal = Number(prevRevenue._sum.totalAmount ?? 0);

        const pctChange = (cur: number, prev: number): number => {
            if (prev === 0) return cur > 0 ? 100 : 0;
            return Number((((cur - prev) / prev) * 100).toFixed(1));
        };

        return {
            totalRevenue,
            totalOrders: currentOrders,
            totalUsers,
            totalProducts,
            newUsers: currentUsers,
            newOrders: currentOrders,
            revenueChange: pctChange(totalRevenue, prevRevenueVal),
            ordersChange: pctChange(currentOrders, prevOrders),
            usersChange: pctChange(currentUsers, prevUsers),
            productsChange: pctChange(currentProducts, prevProducts),
        };
    }

    async getRevenueByDay(
        days = 30,
    ): Promise<Array<{ date: string; revenue: number; orders: number }>> {
        const now = new Date();
        const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const orders = await this.prisma.order.findMany({
            where: { createdAt: { gte: start }, paymentStatus: PaymentStatus.COMPLETED },
            select: { totalAmount: true, createdAt: true },
        });

        const map = new Map<string, { revenue: number; orders: number }>();

        for (let i = 0; i < days; i++) {
            const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            map.set(key, { revenue: 0, orders: 0 });
        }

        for (const order of orders) {
            const key = order.createdAt.toISOString().split('T')[0];
            const entry = map.get(key);
            if (entry) {
                entry.revenue += Number(order.totalAmount);
                entry.orders += 1;
            }
        }

        return Array.from(map.entries()).map(([date, data]) => ({
            date,
            revenue: Number(data.revenue.toFixed(0)),
            orders: data.orders,
        }));
    }

    async getOrderStatusBreakdown(): Promise<
        Array<{ status: string; count: number; label: string }>
    > {
        const results = await this.prisma.order.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        const labels: Record<string, string> = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            PROCESSING: 'Đang xử lý',
            PACKED: 'Đã đóng gói',
            SHIPPING: 'Đang giao',
            DELIVERED: 'Đã giao',
            COMPLETED: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
            RETURN_REQUESTED: 'Yêu cầu trả hàng',
            RETURNED: 'Trả hàng',
            REFUNDED: 'Đã hoàn tiền',
        };

        return results.map(r => ({
            status: r.status,
            count: r._count.status,
            label: labels[r.status] ?? r.status,
        }));
    }

    async getTopProducts(limit = 10): Promise<
        Array<{
            id: string;
            name: string;
            image: string | null;
            soldCount: number;
            revenue: number;
        }>
    > {
        const products = await this.prisma.product.findMany({
            where: { status: ResourceStatus.APPROVED, soldCount: { gt: 0 } },
            orderBy: { soldCount: 'desc' },
            take: limit,
            select: { id: true, name: true, images: true, soldCount: true },
        });

        const productIds = products.map(p => p.id);

        const orderItems = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            where: { productId: { in: productIds } },
            _sum: { subtotal: true },
        });

        const revenueMap = new Map(
            orderItems.map(i => [i.productId, Number(i._sum?.subtotal ?? 0)]),
        );

        return products.map(p => ({
            id: p.id,
            name: p.name,
            image: p.images?.[0] ?? null,
            soldCount: p.soldCount,
            revenue: revenueMap.get(p.id) ?? 0,
        }));
    }

    async getTopCategories(
        limit = 8,
    ): Promise<
        Array<{ categoryId: string; categoryName: string; revenue: number; orders: number }>
    > {
        const paidOrders = await this.prisma.order.findMany({
            where: { paymentStatus: PaymentStatus.COMPLETED },
            select: { orderItems: { select: { subtotal: true, productId: true } } },
        });

        const productIds = [
            ...new Set(paidOrders.flatMap(o => o.orderItems.map(i => i.productId))),
        ];

        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, categoryId: { not: null } },
            select: { id: true, categoryId: true, category: { select: { id: true, name: true } } },
        });

        const productCategoryMap = new Map(products.map(p => [p.id, p.category]));

        const map = new Map<string, { categoryName: string; revenue: number; orders: number }>();

        for (const order of paidOrders) {
            for (const item of order.orderItems) {
                const cat = productCategoryMap.get(item.productId);
                if (!cat) continue;
                const existing = map.get(cat.id) ?? {
                    categoryName: cat.name,
                    revenue: 0,
                    orders: 0,
                };
                existing.revenue += Number(item.subtotal);
                existing.orders += 1;
                map.set(cat.id, existing);
            }
        }

        return Array.from(map.entries())
            .map(([categoryId, data]) => ({ categoryId, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    async getRecentOrders(limit = 10): Promise<
        Array<{
            id: string;
            orderNumber: string;
            status: OrderStatus;
            totalAmount: number;
            createdAt: Date;
            userEmail: string;
            userName: string;
        }>
    > {
        const orders = await this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        email: true,
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        return orders.map(o => {
            const name = [o.user.profile?.firstName, o.user.profile?.lastName]
                .filter(Boolean)
                .join(' ');
            return {
                id: o.id,
                orderNumber: o.id.slice(0, 8).toUpperCase(),
                status: o.status,
                totalAmount: Number(o.totalAmount),
                createdAt: o.createdAt,
                userEmail: o.user.email,
                userName: name || o.user.email,
            };
        });
    }

    async getRecentActivity(limit = 15): Promise<
        Array<{
            id: string;
            action: string;
            entityType: string | null;
            entityId: string | null;
            userEmail: string;
            userName: string;
            status: string;
            createdAt: Date;
        }>
    > {
        const logs = await this.prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        email: true,
                        profile: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        return logs.map(l => {
            const name = [l.user?.profile?.firstName, l.user?.profile?.lastName]
                .filter(Boolean)
                .join(' ');
            const userEmail = l.user?.email ?? 'System';
            return {
                id: l.id,
                action: l.action,
                entityType: l.entityType,
                entityId: l.entityId,
                userEmail,
                userName: name || userEmail,
                status: l.status,
                createdAt: l.createdAt,
            };
        });
    }

    async getDashboardData(rangeDays = 30) {
        const [
            overview,
            revenueByDay,
            orderStatus,
            topProducts,
            topCategories,
            recentOrders,
            recentActivity,
        ] = await Promise.all([
            this.getOverview(rangeDays),
            this.getRevenueByDay(rangeDays),
            this.getOrderStatusBreakdown(),
            this.getTopProducts(10),
            this.getTopCategories(8),
            this.getRecentOrders(10),
            this.getRecentActivity(15),
        ]);

        return {
            overview,
            revenueByDay,
            orderStatus,
            topProducts,
            topCategories,
            recentOrders,
            recentActivity,
        };
    }
}
