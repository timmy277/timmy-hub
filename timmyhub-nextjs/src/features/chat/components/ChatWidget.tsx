'use client';

import React, { useEffect, useState, useRef, FormEvent, useMemo } from 'react';
import { 
    Box, 
    ActionIcon, 
    Avatar, 
    Popover, 
    Text, 
    Stack, 
    Group, 
    ScrollArea, 
    TextInput, 
    UnstyledButton,
    Loader
} from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/auth';
import { chatService } from '@/services/chat.service';
import { io, Socket } from 'socket.io-client';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { IconPath } from '@/components/icons/IconPath';
import { UserRole } from '@/types/enums';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';



type ChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    sender: { id: string; profile: { displayName: string; avatar: string | null } };
};

type ChatHeadProps = {
    contactId: string;
    contactName: string;
    contactAvatar: string | null;
    isMain?: boolean;
    opened: boolean;
    onToggle: () => void;
    socket: Socket | null;
    currentUser: User;
    defaultAdminId?: string;
    unreadCount?: number;
};

// Component xử lý từng hộp thoại chat
function SingleChat({
    contactId,
    contactName,
    contactAvatar,
    isMain,
    opened,
    onToggle,
    socket,
    currentUser,
    defaultAdminId
}: ChatHeadProps) {
    const { data: messagesRes, isLoading: isMessagesLoading } = useQuery({
        queryKey: QUERY_KEYS.CHAT_MESSAGES(contactId),
        queryFn: () => chatService.getMessages(contactId, { limit: 50 }),
        enabled: opened && !!contactId,
        staleTime: 60 * 1000,
    });
    
    const initialMessages = useMemo(() => messagesRes?.data || [], [messagesRes?.data]);
    const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialMessages.length > 0) {
            setRealtimeMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        if (!socket || !opened) return;
        const handleReceive = (msg: ChatMessage) => {
            if ((msg.senderId === contactId && msg.receiverId === currentUser.id) || 
                (msg.senderId === currentUser.id && msg.receiverId === contactId)) {
                setRealtimeMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.on('chat:receive', handleReceive);
        return () => {
            socket.off('chat:receive', handleReceive);
        };
    }, [socket, opened, contactId, currentUser.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [realtimeMessages, opened]);

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        const content = text.trim();
        if (!content || !socket) return;
        
        socket.emit('chat:send', {
            receiverId: contactId,
            content
        }, (res: { status: string; message: ChatMessage }) => {
            if (res && res.status === 'ok') {
                setRealtimeMessages(prev => {
                    if (prev.some(m => m.id === res.message.id)) return prev;
                    return [...prev, res.message];
                });
            } else {
                console.error('Failed to send message:', res);
            }
        });

        setText('');
    };

    return (
        <Popover opened={opened} onChange={() => onToggle()} position="left-end" offset={16} withArrow shadow="md" withinPortal={false}>
            <Popover.Target>
                {isMain ? (
                    <ActionIcon 
                        size={56} 
                        radius="xl" 
                        color="blue.6" 
                        variant="filled" 
                        onClick={onToggle}
                        style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    >
                        {opened ? (
                           <IconPath name="x" size={24} color="currentColor" />
                        ) : (
                           <IconPath name="message-circle" size={24} color="currentColor" />
                        )}
                    </ActionIcon>
                ) : (
                    <ActionIcon 
                        size={56} 
                        radius="xl" 
                        color="gray.1" 
                        variant="filled" 
                        onClick={onToggle}
                        style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    >
                        <Avatar src={contactAvatar} radius="xl" size={56}>
                            {contactName.charAt(0) || 'A'}
                        </Avatar>
                    </ActionIcon>
                )}
            </Popover.Target>

            <Popover.Dropdown p={0} style={{ width: 340, borderRadius: 16, overflow: 'hidden' }}>
                <Box bg="blue.6" c="white" p="md">
                    <Group gap="sm" wrap="nowrap">
                        <Avatar src={contactAvatar} radius="xl" color="blue.2">
                            {contactName.charAt(0) || 'A'}
                        </Avatar>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group gap={6} align="center">
                                <Text fw={600} size="sm" truncate>{contactName}</Text>
                                {(contactId !== defaultAdminId) && (
                                    <Box bg="red.1" c="red.6" px={4} py={0} style={{ borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        ADMIN
                                    </Box>
                                )}
                            </Group>
                            <Text size="xs" opacity={0.8} truncate>{isMain ? 'Chúng tôi sẽ trả lời sớm nhất!' : 'Quản trị viên TimmyHub'}</Text>
                        </Box>
                    </Group>
                </Box>

                <ScrollArea h={320} p="md" viewportRef={scrollRef}>
                    {isMessagesLoading ? (
                        <Group justify="center" h="100%">
                            <Loader size="sm" color="blue" />
                        </Group>
                    ) : realtimeMessages.length === 0 ? (
                        <Group justify="center" h="100%">
                            <Text size="sm" c="dimmed">Hãy gửi lời chào đến chúng tôi!</Text>
                        </Group>
                    ) : (
                        <Stack gap="xs">
                            {realtimeMessages.map(msg => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <Box key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        {!isMe && (
                                            <Group gap={6} mb={4} wrap="nowrap" align="center">
                                                <Avatar 
                                                    src={msg.sender?.profile?.avatar || contactAvatar} 
                                                    size={20} 
                                                    radius="xl"
                                                />
                                                <Text size="xs" fw={600} c="dimmed" truncate>
                                                    {msg.sender?.profile?.displayName || contactName}
                                                </Text>
                                            </Group>
                                        )}
                                        <Box 
                                            bg={isMe ? 'blue.6' : 'gray.1'} 
                                            c={isMe ? 'white' : 'dark'}
                                            px={12} py={8}
                                            style={{ borderRadius: 12, borderBottomRightRadius: isMe ? 2 : 12, borderBottomLeftRadius: isMe ? 12 : 2 }}
                                        >
                                            <Text size="sm">{msg.content}</Text>
                                        </Box>
                                        <Text size="xs" c="dimmed" ta={isMe ? 'right' : 'left'} mt={2}>
                                            {dayjs(msg.createdAt).format('HH:mm')}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </ScrollArea>

                <Box p="xs" style={{ borderTop: '1px solid #f1f3f5' }}>
                    <form onSubmit={handleSend}>
                        <TextInput
                            placeholder="Nhập tin nhắn..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rightSection={
                                <UnstyledButton type="submit" mt={4} mr={4} c="blue.6" disabled={!text.trim()}>
                                    <IconPath name="send" size={20} color="currentColor" />
                                </UnstyledButton>
                            }
                        />
                    </form>
                </Box>
            </Popover.Dropdown>
        </Popover>
    );
}

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
        if (!isAuthenticated || !user) return;
        const newSocket = io(`${SOCKET_URL}/chat`, {
            auth: { token: Cookies.get('access_token') },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
             setSocket(newSocket);
        });

        newSocket.on('chat:receive', (msg: ChatMessage) => {
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

    const otherAdmins = dynamicContacts.filter(c => c.id !== defaultAdmin?.id);

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
                        isMain={true}
                        opened={openedContactId === defaultAdmin.id}
                        onToggle={() => setOpenedContactId(prev => prev === defaultAdmin.id ? null : defaultAdmin.id)}
                        socket={socket}
                        currentUser={user}
                        defaultAdminId={defaultAdmin.id}
                    />
                )}
            </Stack>
        </Box>
    );
}
