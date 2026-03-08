export enum NotificationType {
    ORDER = 'ORDER',
    MESSAGE = 'MESSAGE',
    PROMOTION = 'PROMOTION',
    SYSTEM = 'SYSTEM',
    REVIEW = 'REVIEW',
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    content: string;
    link?: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
}
