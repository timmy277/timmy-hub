'use client';

import React, { useEffect, useState, useMemo } from 'react';
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

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const VIRTUAL_BOT_ID = 'ai-assistant-bot';

export function ChatWidget() {
    const { user, isAuthenticated } = useAuth();
    const [openedContactId, setOpenedContactId] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
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

    const dynamicContacts = useMemo(() => {
        const base = contactsRes?.data || [];
        const combined = [...socketNewContacts, ...base];
        // Deduplicate by ID
        return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    }, [contactsRes?.data, socketNewContacts]);

    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (!detail || !detail.id) return;
            // Prevent opening chat with oneself
            if (user?.id === detail.id) return;

            setSocketNewContacts(prev => {
                const exists = prev.some(c => c.id === detail.id) || (contactsRes?.data?.some(c => c.id === detail.id));
                if (!exists) {
                    return [...prev, {
                        id: detail.id,
                        displayName: detail.name,
                        avatar: detail.avatar || null,
                        lastMessageAt: new Date().toISOString(),
                        lastMessage: ''
                    }];
                }
                return prev;
            });
            setTimeout(() => setOpenedContactId(detail.id), 50);
        };

        window.addEventListener('openChat', handleOpenChat);
        return () => window.removeEventListener('openChat', handleOpenChat);
    }, [contactsRes?.data, user?.id]);

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
            // Check if sender is already in contacts, if not, refetch!
            if (msg.senderId !== defaultAdmin?.id && msg.senderId !== user.id) {
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
    }, [isAuthenticated, user, defaultAdmin?.id, refetchContacts, contactsRes?.data]);

    if (!user || user.roles.includes(UserRole.ADMIN)) {
        return null;
    }

    const otherAdmins = dynamicContacts.filter(c => c.id !== defaultAdmin?.id && c.id !== VIRTUAL_BOT_ID);

    return (
        <Box style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
            <Stack gap="md" align="flex-end">
                {otherAdmins.map(contact => (
                    <SingleChat
                        key={contact.id}
                        contactId={contact.id}
                        contactName={contact.displayName}
                        contactAvatar={contact.avatar || null}
                        opened={openedContactId === contact.id}
                        onToggle={() => setOpenedContactId(prev => prev === contact.id ? null : contact.id)}
                        socket={socket}
                        currentUser={user}
                        defaultAdminId={defaultAdmin?.id}
                    />
                ))}

                {defaultAdmin && (
                    <SingleChat
                        contactId={defaultAdmin.id}
                        contactName={defaultAdmin.displayName || 'Admin Hỗ Trợ'}
                        contactAvatar={defaultAdmin.avatar || null}
                        opened={openedContactId === defaultAdmin.id}
                        onToggle={() => setOpenedContactId(prev => prev === defaultAdmin.id ? null : defaultAdmin.id)}
                        socket={socket}
                        currentUser={user}
                        defaultAdminId={defaultAdmin.id}
                    />
                )}

                <SingleChat
                    contactId={VIRTUAL_BOT_ID}
                    contactName="Trợ lý AI"
                    contactAvatar={null}
                    isMain={true}
                    mainIcon={<Iconify icon="tabler:robot" width={24} color="currentColor" />}
                    opened={openedContactId === VIRTUAL_BOT_ID}
                    onToggle={() => setOpenedContactId(prev => prev === VIRTUAL_BOT_ID ? null : VIRTUAL_BOT_ID)}
                    socket={socket}
                    currentUser={user}
                    defaultAdminId={defaultAdmin?.id}
                />
            </Stack>
        </Box>
    );
}
