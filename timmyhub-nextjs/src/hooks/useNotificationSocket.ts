import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import type { Notification } from '@/types/notification';

export function useNotificationSocket() {
    const { isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [newNotification, setNewNotification] = useState<Notification | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const newSocket = io(`${backendUrl}/notifications`, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('🔗 Notification Socket connected');
            setSocket(newSocket);
        });

        newSocket.on('notification:new', (notification: Notification) => {
            console.log('🔔 New notification received:', notification);
            setNewNotification(notification);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Notification Socket disconnected');
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated]);

    return { socket, newNotification, clearNewNotification: () => setNewNotification(null) };
}
