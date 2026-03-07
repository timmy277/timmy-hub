'use client';

import React, { useEffect, useState, useRef, FormEvent, useMemo } from 'react';
import { 
    Box, 
    Text, 
    Stack, 
    Group, 
    ScrollArea, 
    TextInput, 
    UnstyledButton,
    Loader,
    Avatar,
    Paper,
    Flex
} from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { io, Socket } from 'socket.io-client';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { IconPath } from '@/components/icons/IconPath';
import { useSearchParams, useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type ChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
};

export function AdminChat() {
    const { user, isAuthenticated } = useAuth();
    const [selectedContact, setSelectedContact] = useState<{ id: string; displayName: string; avatar: string | null } | null>(null);
    const [text, setText] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const userIdQuery = searchParams.get('userId');

    // Fetch contacts
    const { data: contactsRes, isLoading: isContactsLoading, refetch: refetchContacts } = useQuery({
        queryKey: QUERY_KEYS.CHAT_CONTACTS,
        queryFn: () => chatService.getContacts(),
        enabled: isAuthenticated && !!user,
        staleTime: 60 * 1000,
    });
    
    type Contact = {
        id: string;
        displayName: string;
        avatar: string | null;
        lastMessage?: string;
        lastMessageAt?: string;
    };
    
    // Manage local contacts list so we can inject new contact not yet in history
    const [contacts, setContacts] = useState<Contact[]>([]);

    useEffect(() => {
        if (contactsRes?.data) {
            setContacts(contactsRes.data);
        }
    }, [contactsRes?.data]);

    // Handle initial user selection from query param
    useEffect(() => {
        if (!userIdQuery || !isAuthenticated) return;
        
        const existingContact = contacts.find(c => c.id === userIdQuery);
        if (existingContact) {
            setSelectedContact(existingContact);
            router.replace('/admin/chat');
        } else if (contactsRes?.data && contacts.length > 0) {
            // Fetch user info since not in contact
            userService.getUserById(userIdQuery).then(res => {
                if (res?.data) {
                    const u = res.data;
                    const name = u.profile?.displayName || (u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName}` : (u.email?.split('@')[0] || 'User'));
                    const newContact: Contact = { 
                        id: u.id, 
                        displayName: name, 
                        avatar: u.profile?.avatar || null,
                        lastMessage: '...',
                        lastMessageAt: new Date().toISOString()
                    };
                    setContacts(prev => [newContact, ...prev]);
                    setSelectedContact(newContact);
                    router.replace('/admin/chat');
                }
            }).catch(e => console.error("Error fetching user for chat:", e));
        }
    }, [userIdQuery, isAuthenticated, contacts, contactsRes?.data, router]);

    // Fetch Messages
    const { data: messagesRes, isLoading: isMessagesLoading } = useQuery({
        queryKey: QUERY_KEYS.CHAT_MESSAGES(selectedContact?.id || ''),
        queryFn: () => chatService.getMessages(selectedContact!.id, { limit: 100 }),
        enabled: !!selectedContact?.id,
        staleTime: 60 * 1000,
    });
    
    const initialMessages = useMemo(() => messagesRes?.data || [], [messagesRes?.data]);
    const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
    
    useEffect(() => {
        if (initialMessages.length > 0) {
            setRealtimeMessages(initialMessages);
        } else {
            setRealtimeMessages([]);
        }
    }, [initialMessages, selectedContact]);

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        const socket = io(`${SOCKET_URL}/chat`, {
            auth: { token: Cookies.get('access_token') },
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => console.log('Admin Chat Socket connected:', socket.id));

        socket.on('chat:receive', (msg: ChatMessage) => {
             refetchContacts();
             setRealtimeMessages(prev => {
                 // Check if message is for the currently selected customer
                 // Note: we might receive messages from other contacts while talking to X
                 if (msg.senderId !== selectedContact?.id && msg.receiverId !== selectedContact?.id) {
                     return prev; 
                 }
                 if (prev.some(m => m.id === msg.id)) return prev;
                 return [...prev, msg];
             });
        });

        return () => {
            socket.off('connect');
            socket.off('chat:receive');
            socket.disconnect();
        };
    }, [isAuthenticated, user, refetchContacts, selectedContact?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [realtimeMessages, selectedContact]);

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !selectedContact || !socketRef.current) return;

        const content = text;
        setText('');
        
        socketRef.current.emit('chat:send', {
            receiverId: selectedContact.id,
            content
        }, (res: { status: string; message: ChatMessage }) => {
            if (res && res.status === 'ok') {
                refetchContacts();
                setRealtimeMessages(prev => {
                    if (prev.some(m => m.id === res.message.id)) return prev;
                    return [...prev, res.message];
                });
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                }
            } else {
                console.error('Lỗi khi gửi tin nhắn');
            }
        });
    };

    return (
        <Paper shadow="sm" radius="md" p={0} style={{ overflow: 'hidden', border: '1px solid #e9ecef', flex: 1, display: 'flex' }}>
            <Flex style={{ width: '100%', height: '100%' }}>
                {/* Panel bên trái: Danh sách Contact */}
                <Box style={{ width: '33.333%', borderRight: '1px solid #e9ecef', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
                        <Text fw={600} size="lg">Hội thoại</Text>
                    </Box>
                    <ScrollArea style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                        {isContactsLoading ? (
                            <Group justify="center" h={100}><Loader size="sm" /></Group>
                        ) : contacts.length === 0 ? (
                            <Box p="md"><Text c="dimmed" size="sm" ta="center">Chưa có cuộc trò chuyện nào</Text></Box>
                        ) : (
                            contacts.map(contact => (
                                <UnstyledButton
                                    key={contact.id}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: selectedContact?.id === contact.id ? '#e7f5ff' : 'transparent',
                                        borderBottom: '1px solid #e9ecef',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={() => setSelectedContact(contact)}
                                    title={contact.displayName}
                                >
                                    <Group wrap="nowrap">
                                        <Avatar src={contact.avatar} radius="xl" color="blue">
                                            {contact.displayName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Group justify="space-between" mb={4} wrap="nowrap">
                                                <Text size="sm" fw={selectedContact?.id === contact.id ? 600 : 500} truncate>
                                                    {contact.displayName}
                                                </Text>
                                                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                                    {dayjs(contact.lastMessageAt).format('HH:mm')}
                                                </Text>
                                            </Group>
                                            <Text size="xs" c="dimmed" truncate>{contact.lastMessage}</Text>
                                        </div>
                                    </Group>
                                </UnstyledButton>
                            ))
                        )}
                    </ScrollArea>
                </Box>

                {/* Panel bên Phải: Tin nhắn */}
                <Box style={{ width: '66.666%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {selectedContact ? (
                        <>
                            {/* Header Chat */}
                            <Box p="md" style={{ borderBottom: '1px solid #e9ecef', backgroundColor: 'white' }}>
                                <Group wrap="nowrap">
                                    <Avatar src={selectedContact.avatar} radius="xl" color="blue" size="md">
                                        {selectedContact.displayName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <Text fw={600} size="md">{selectedContact.displayName}</Text>
                                        <Text size="xs" c="dimmed">Khách hàng</Text>
                                    </div>
                                </Group>
                            </Box>

                            {/* Khung chat */}
                            <ScrollArea viewportRef={scrollRef} style={{ flex: 1, padding: '16px', backgroundColor: '#fff' }} type="always" offsetScrollbars>
                                {isMessagesLoading ? (
                                    <Group justify="center" mt="xl"><Loader size="sm" /></Group>
                                ) : realtimeMessages.length === 0 ? (
                                    <Group justify="center" mt="xl">
                                        <Text size="sm" c="dimmed">Chưa có tin nhắn nào</Text>
                                    </Group>
                                ) : (
                                    <Stack gap="sm">
                                        {realtimeMessages.map(msg => {
                                            const isMe = msg.senderId === user?.id;
                                            return (
                                                <Box key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                                    <Box 
                                                        bg={isMe ? 'blue.6' : 'gray.1'} 
                                                        c={isMe ? 'white' : 'dark'}
                                                        px={16} py={10}
                                                        style={{ borderRadius: 16, borderBottomRightRadius: isMe ? 4 : 16, borderBottomLeftRadius: isMe ? 16 : 4 }}
                                                    >
                                                        <Text size="md">{msg.content}</Text>
                                                    </Box>
                                                    <Text size="xs" c="dimmed" ta={isMe ? 'right' : 'left'} mt={4}>
                                                        {dayjs(msg.createdAt).format('HH:mm - DD/MM')}
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </ScrollArea>

                            {/* Input Form */}
                            <Box p="md" style={{ borderTop: '1px solid #e9ecef', backgroundColor: 'white' }}>
                                <form onSubmit={handleSend}>
                                    <TextInput
                                        placeholder="Nhập tin nhắn để trả lời..."
                                        value={text}
                                        onChange={e => setText(e.target.value)}
                                        size="md"
                                        radius="xl"
                                        rightSection={
                                            <UnstyledButton type="submit" mt={4} mr={4} c="blue.6" disabled={!text.trim()}>
                                                <IconPath name="send" size={24} color="currentColor" />
                                            </UnstyledButton>
                                        }
                                    />
                                </form>
                            </Box>
                        </>
                    ) : (
                        <Group justify="center" style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                            <Stack align="center" gap="xs">
                                <IconPath name="message-circle" size={48} color="#adb5bd" />
                                <Text c="dimmed" size="lg">Chọn một khách hàng để bắt đầu trò chuyện</Text>
                            </Stack>
                        </Group>
                    )}
                </Box>
            </Flex>
        </Paper>
    );
}
