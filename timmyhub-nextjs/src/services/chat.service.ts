import axiosClient from '@/libs/axios';
import type { ApiResponse } from '@/types/api';

export const chatService = {
    getAdmin: async (): Promise<ApiResponse<{ id: string; displayName: string; avatar: string | null }>> => {
        return axiosClient.get('/chat/admin');
    },
    getMessages: async (contactId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<Array<{id: string; content: string; senderId: string; receiverId: string; createdAt: string; sender: { id: string; profile: { displayName: string; avatar: string | null } } }>>> => {
        return axiosClient.get(`/chat/messages/${contactId}`, { params });
    },
    getContacts: async (): Promise<ApiResponse<Array<{ id: string; displayName: string; avatar: string | null; lastMessage: string; lastMessageAt: string; }>>> => {
        return axiosClient.get('/chat/contacts');
    },
    /** Lấy số tin nhắn chưa đọc theo từng contact */
    getUnreadCounts: async (): Promise<ApiResponse<Record<string, number>>> => {
        return axiosClient.get('/chat/unread');
    },
    /** Lấy tổng số tin nhắn chưa đọc */
    getTotalUnreadCount: async (): Promise<ApiResponse<number>> => {
        return axiosClient.get('/chat/unread/total');
    },
    /** Đánh dấu tin nhắn từ một contact là đã đọc */
    markAsRead: async (contactId: string): Promise<ApiResponse<{ markedAsRead: number }>> => {
        return axiosClient.post(`/chat/read/${contactId}`);
    },
    /** Đánh dấu tất cả tin nhắn là đã đọc */
    markAllAsRead: async (): Promise<ApiResponse<{ markedAsRead: number }>> => {
        return axiosClient.post('/chat/read-all');
    },
};
