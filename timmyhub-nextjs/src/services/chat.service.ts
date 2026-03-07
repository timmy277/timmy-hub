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
    }
};
