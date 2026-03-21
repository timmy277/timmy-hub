/**
 * Hook để sync unread counts từ BE
 * Hybrid approach:
 * - Khi init: fetch unread từ BE
 * - Khi có socket message: increment local (FE-only)
 * - Khi mở chat: gọi BE markAsRead + reset local
 */
'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { QUERY_KEYS } from '@/constants';
import { useChatStore } from '@/stores/useChatStore';
import { useAuth } from '@/hooks/useAuth';

export function useChatUnread() {
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    const { incrementUnread, resetUnread, setUnreadCounts } = useChatStore();

    // 1. Fetch unread counts từ BE khi login
    const { data: unreadData, isLoading: isUnreadLoading } = useQuery({
        queryKey: QUERY_KEYS.CHAT_UNREAD,
        queryFn: async () => {
            const res = await chatService.getUnreadCounts();
            return res.data;
        },
        enabled: isAuthenticated && !!user,
        staleTime: 30 * 1000, // 30s - khá ngắn vì unread count thay đổi thường xuyên
    });

    // 2. Set unread counts vào store khi có data từ BE
    useEffect(() => {
        if (unreadData && Object.keys(unreadData).length > 0) {
            setUnreadCounts(unreadData);
        }
    }, [unreadData, setUnreadCounts]);

    // 3. Mutation để mark as read
    const markAsReadMutation = useMutation({
        mutationFn: async (contactId: string) => {
            await chatService.markAsRead(contactId);
            return contactId;
        },
        onSuccess: (contactId) => {
            // Reset local unread count
            resetUnread(contactId);
            // Invalidate để fetch lại từ BE
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT_UNREAD });
        },
    });

    // 4. Mutation để mark all as read
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await chatService.markAllAsRead();
        },
        onSuccess: () => {
            // Reset all local unread counts
            setUnreadCounts({});
            // Invalidate để fetch lại từ BE
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT_UNREAD });
        },
    });

    // 5. Helper để increment khi nhận socket message
    const handleIncomingMessage = (senderId: string) => {
        incrementUnread(senderId);
    };

    // 6. Helper để mark read khi mở chat
    const handleOpenChat = (contactId: string) => {
        markAsReadMutation.mutate(contactId);
    };

    return {
        isUnreadLoading,
        markAsRead: handleOpenChat,
        markAllAsRead: () => markAllAsReadMutation.mutate(),
        handleIncomingMessage,
    };
}
