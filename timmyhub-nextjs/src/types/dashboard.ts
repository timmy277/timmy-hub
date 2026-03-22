export interface DashboardOverview {
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
}

export interface RevenueByDay {
    date: string;
    revenue: number;
    orders: number;
}

export interface OrderStatusItem {
    status: string;
    count: number;
    label: string;
}

export interface TopProduct {
    id: string;
    name: string;
    image: string | null;
    soldCount: number;
    revenue: number;
}

export interface TopCategory {
    categoryId: string;
    categoryName: string;
    revenue: number;
    orders: number;
}

export interface RecentOrder {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    userEmail: string;
    userName: string;
}

export interface ActivityItem {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    userEmail: string;
    userName: string;
    status: string;
    createdAt: string;
}

export interface DashboardData {
    overview: DashboardOverview;
    revenueByDay: RevenueByDay[];
    orderStatus: OrderStatusItem[];
    topProducts: TopProduct[];
    topCategories: TopCategory[];
    recentOrders: RecentOrder[];
    recentActivity: ActivityItem[];
}
