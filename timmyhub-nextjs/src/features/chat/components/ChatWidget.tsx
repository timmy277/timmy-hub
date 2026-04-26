'use client';

import { useEffect, useState, useMemo } from 'react';
import { Box, Stack } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { UserRole } from '@/types/enums';
import Iconify from '@/components/iconify/Iconify';
import { SingleChat } from './SingleChat';
import { TChatMessage } from '@/types/chat';
import { useChatStore } from '@/stores/useChatStore';
import { useChatUnread } from '@/hooks/useChatUnread';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const VIRTUAL_BOT_ID = 'ai-assistant-bot';

interface ChatWidgetProps {
    externalOpenContactId?: string | null;
}

export function ChatWidget({ externalOpenContactId }: ChatWidgetProps) {
    const { user, isAuthenticated } = useAuth();
    const [openedContactId, setOpenedContactId] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { activeChat, openChat, hiddenAvatars, hideAvatar, unreadCounts } = useChatStore();

    // Hook để sync unread counts từ BE + gọi markAsRead
    const { handleIncomingMessage, markAsRead } = useChatUnread();
    type Contact = { id: string; displayName: string; avatar: string | null; lastMessageAt: string; lastMessage: string };

    const { data: adminRes } = useQuery({
        queryKey: QUERY_KEYS.CHAT_ADMIN,
        queryFn: () => chatService.getAdmin(),
        enabled: isAuthenticated && !!user,
        staleTime: 5 * 60 * 1000,
    });
    const defaultAdmin = adminRes?.data || null;

    const { data: contactsRes, refetch: refetchContacts } = useQuery({
        queryKey: QUERY_KEYS.CHAT_CONTACTS,
        queryFn: () => chatService.getContacts(),
        enabled: isAuthenticated && !!user,
        staleTime: 60 * 1000,
    });

    const [socketNewContacts, setSocketNewContacts] = useState<Contact[]>([]);

    // Derive contacts from store + API - no need for useEffect with setState
    const effectiveOpenedContactId = externalOpenContactId || openedContactId || activeChat?.id || null;

    const dynamicContacts = useMemo(() => {
        const base = contactsRes?.data || [];
        // Add activeChat if it's not already in the list
        const activeContact = activeChat && !base.some(c => c.id === activeChat.id) && !socketNewContacts.some(c => c.id === activeChat.id)
            ? [{
                id: activeChat.id,
                displayName: activeChat.name,
                avatar: activeChat.avatar,
                lastMessageAt: new Date().toISOString(),
                lastMessage: ''
            }]
            : [];
        const combined = [...socketNewContacts, ...activeContact, ...base];
        return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    }, [contactsRes?.data, socketNewContacts, activeChat]);

    // Keep event listener for backward compatibility, but prioritize store
    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (!detail || !detail.id) return;
            if (user?.id === detail.id) return;

            openChat({ id: detail.id, name: detail.name, avatar: detail.avatar || null });
        };

        window.addEventListener('openChat', handleOpenChat);
        return () => window.removeEventListener('openChat', handleOpenChat);
    }, [openChat, user?.id]);

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        const newSocket = io(`${SOCKET_URL}/chat`, {
            auth: { token: Cookies.get('access_token') },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            setSocket(newSocket);
        });

        newSocket.on('chat:receive', (msg: TChatMessage) => {
            const isIncoming = msg.senderId !== user.id && msg.receiverId === user.id;
            const isFromNonAdmin = msg.senderId !== defaultAdmin?.id;

            if (isIncoming && isFromNonAdmin) {
                handleIncomingMessage(msg.senderId);
                setSocketNewContacts(prev => {
                    const exists = prev.some(c => c.id === msg.senderId) || (contactsRes?.data?.some(c => c.id === msg.senderId));
                    if (!exists) {
                        refetchContacts();
                        return [...prev, {
                            id: msg.senderId,
                            displayName: msg.sender?.profile?.displayName || 'Admin',
                            avatar: msg.sender?.profile?.avatar || null,
                            lastMessageAt: msg.createdAt,
                            lastMessage: msg.content
                        }];
                    }
                    return prev;
                });
            }
        });

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id]);

    if (!user || user.roles.includes(UserRole.ADMIN)) {
        return null;
    }

    // Filter bỏ các avatar đã bị ẩn (giống Facebook)
    const visibleContacts = dynamicContacts.filter(c => !hiddenAvatars.includes(c.id));

    // Filter admin và bot
    const otherAdmins = visibleContacts.filter(c => c.id !== defaultAdmin?.id && c.id !== VIRTUAL_BOT_ID);

    // Handler đóng chat - đóng khung chat
    const handleCloseChat = (contactId: string) => {
        setOpenedContactId(prev => prev === contactId ? null : prev);
    };

    return (
        <Box style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
            <Stack gap="md" align="flex-end">
                {otherAdmins.map(contact => (
                    <SingleChat
                        key={contact.id}
                        contactId={contact.id}
                        contactName={contact.displayName}
                        contactAvatar={contact.avatar || null}
                        opened={effectiveOpenedContactId === contact.id}
                        onToggle={() => {
                            if (effectiveOpenedContactId === contact.id) {
                                setOpenedContactId(null);
                            } else {
                                setOpenedContactId(contact.id);
                                markAsRead(contact.id);
                            }
                        }}
                        onCloseChat={() => handleCloseChat(contact.id)}
                        socket={socket}
                        currentUser={user}
                        defaultAdminId={defaultAdmin?.id}
                        hideAvatar={hideAvatar}
                        unreadCount={unreadCounts[contact.id] || 0}
                    />
                ))}

                {defaultAdmin && (
                    <SingleChat
                        contactId={defaultAdmin.id}
                        contactName={defaultAdmin.displayName || 'Admin Hỗ Trợ'}
                        contactAvatar={defaultAdmin.avatar || null}
                        opened={effectiveOpenedContactId === defaultAdmin.id}
                        onToggle={() => {
                            if (effectiveOpenedContactId === defaultAdmin.id) {
                                setOpenedContactId(null);
                            } else {
                                setOpenedContactId(defaultAdmin.id);
                                markAsRead(defaultAdmin.id);
                            }
                        }}
                        onCloseChat={() => handleCloseChat(defaultAdmin.id)}
                        socket={socket}
                        currentUser={user}
                        defaultAdminId={defaultAdmin.id}
                        hideAvatar={hideAvatar}
                        unreadCount={unreadCounts[defaultAdmin.id] || 0}
                    />
                )}

                {visibleContacts.filter(c => c.id === VIRTUAL_BOT_ID).length === 0 && (
                    <SingleChat
                        contactId={VIRTUAL_BOT_ID}
                        contactName="Trợ lý AI"
                        contactAvatar={null}
                        isMain={true}
                        mainIcon={<Iconify icon="solar:stars-bold-duotone" width={24} color="currentColor" />}
                        opened={effectiveOpenedContactId === VIRTUAL_BOT_ID}
                        onToggle={() => setOpenedContactId(prev => prev === VIRTUAL_BOT_ID ? null : VIRTUAL_BOT_ID)}
                        onCloseChat={() => handleCloseChat(VIRTUAL_BOT_ID)}
                        socket={socket}
                        currentUser={user}
                        defaultAdminId={defaultAdmin?.id}
                        hideAvatar={hideAvatar}
                        unreadCount={unreadCounts[VIRTUAL_BOT_ID] || 0}
                    />
                )}
            </Stack>
        </Box>
    );
}
