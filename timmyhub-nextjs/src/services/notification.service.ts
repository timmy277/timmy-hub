import axiosClient from '@/libs/axios';
import type { NotificationResponse } from '@/types/notification';

export const notificationService = {
    async getMyNotifications(page = 1, limit = 10): Promise<NotificationResponse> {
        const res = await axiosClient.get('/notifications', { params: { page, limit } });
        return res as unknown as NotificationResponse;
    },

    async getUnreadCount(): Promise<{ count: number }> {
        const res = await axiosClient.get('/notifications/unread-count');
        return res as unknown as { count: number };
    },

    async markAsRead(id: string): Promise<void> {
        return axiosClient.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        return axiosClient.patch('/notifications/read-all');
    }
};
