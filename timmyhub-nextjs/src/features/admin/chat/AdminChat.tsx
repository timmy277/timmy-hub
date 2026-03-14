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
    Flex,
    Card,
    ActionIcon,
    Input,
    Tooltip,
} from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat.service';
import { io, Socket } from 'socket.io-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import Iconify from '@/components/iconify/Iconify';
import { useSearchParams, useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';

dayjs.extend(relativeTime);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type ChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
};

type Contact = {
    id: string;
    displayName: string;
    avatar: string | null;
    lastMessage?: string;
    lastMessageAt?: string;
};

export function AdminChat() {
    const { user, isAuthenticated } = useAuth();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [text, setText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
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

    // Manage local contacts list
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

    // Filter contacts by search
    const filteredContacts = useMemo(() => {
        if (!searchQuery) return contacts;
        return contacts.filter(c => c.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [contacts, searchQuery]);

    return (
        <Card shadow="sm" radius="md" p={0} style={{ overflow: 'hidden', height: '88vh', backgroundColor: 'light-dark(#fff, var(--mantine-color-dark-7))' }} withBorder>
            <Flex style={{ width: '100%', height: '100%' }}>
                {/* Left Panel - Contact List */}
                <Box
                    style={{
                        width: 320,
                        borderRight: '1px solid var(--mantine-color-default-border)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
                    }}
                >
                    {/* Header */}
                    <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)', height: 56, boxSizing: 'border-box' }}>
                        <Group justify="space-between" wrap="nowrap" style={{ height: '100%' }}>
                            <Text fw={600} size="lg">Tin nhắn</Text>
                        </Group>
                    </Box>

                    {/* Search */}
                    <Box pb="sm" mt="sm" px="md">
                        <Input
                            placeholder="Tìm kiếm..."
                            leftSection={<Iconify icon="solar:magnifer-bold" width={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            radius="md"
                            variant="filled"
                        />
                    </Box>

                    {/* Contact List */}
                    <ScrollArea style={{ flex: 1 }}>
                        {isContactsLoading ? (
                            <Group justify="center" h={100}><Loader size="sm" /></Group>
                        ) : filteredContacts.length === 0 ? (
                            <Box p="md"><Text c="dimmed" size="sm" ta="center">Không có cuộc trò chuyện nào</Text></Box>
                        ) : (
                            filteredContacts.map(contact => (
                                <UnstyledButton
                                    key={contact.id}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: selectedContact?.id === contact.id ? 'light-dark(var(--mantine-color-blue-light), var(--mantine-color-blue-8))' : 'transparent',
                                        borderBottom: '1px solid var(--mantine-color-default-border)',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={() => setSelectedContact(contact)}
                                    title={contact.displayName}
                                >
                                    <Group wrap="nowrap">
                                        <Box pos="relative">
                                            <Avatar src={contact.avatar} radius="xl" color="blue" size="md">
                                                {contact.displayName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--mantine-color-green-6)',
                                                    border: '2px solid light-dark(white, var(--mantine-color-dark-8))',
                                                }}
                                            />
                                        </Box>
                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                            <Group justify="space-between" mb={4} wrap="nowrap">
                                                <Text size="sm" fw={selectedContact?.id === contact.id ? 600 : 500} truncate>
                                                    {contact.displayName}
                                                </Text>
                                                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                                    {contact.lastMessageAt ? dayjs(contact.lastMessageAt).format('HH:mm') : ''}
                                                </Text>
                                            </Group>
                                            <Text size="xs" c="dimmed" truncate>{contact.lastMessage}</Text>
                                        </Box>
                                    </Group>
                                </UnstyledButton>
                            ))
                        )}
                    </ScrollArea>
                </Box>

                {/* Right Panel - Chat */}
                <Box
                    style={{
                        flex: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
                    }}
                >
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <Box
                                p="md"
                                style={{
                                    borderBottom: '1px solid var(--mantine-color-default-border)',
                                    backgroundColor: 'light-dark(#fff, var(--mantine-color-dark-8))',
                                    height: 56,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <Group wrap="nowrap" justify="space-between" style={{ height: '100%' }}>
                                    <Group wrap="nowrap">
                                        <Avatar src={selectedContact.avatar} radius="xl" color="blue" size="md">
                                            {selectedContact.displayName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <Text fw={600} size="md">{selectedContact.displayName}</Text>
                                            <Text size="xs" c="dimmed">Khách hàng</Text>
                                        </div>
                                    </Group>
                                    <Group gap="xs">
                                        <Tooltip label="Gọi điện">
                                            <ActionIcon variant="subtle" color="gray" size="lg">
                                                <Iconify icon="solar:phone-bold" width={20} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Video call">
                                            <ActionIcon variant="subtle" color="gray" size="lg">
                                                <Iconify icon="solar:videocamera-record-bold" width={20} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Thêm">
                                            <ActionIcon variant="subtle" color="gray" size="lg">
                                                <Iconify icon="solar:menu-dots-bold" width={20} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Group>
                            </Box>

                            {/* Messages */}
                            <ScrollArea
                                viewportRef={scrollRef}
                                style={{ flex: 1, padding: '16px' }}
                                type="always"
                                offsetScrollbars
                            >
                                {isMessagesLoading ? (
                                    <Group justify="center" mt="xl"><Loader size="sm" /></Group>
                                ) : realtimeMessages.length === 0 ? (
                                    <Group justify="center" mt="xl">
                                        <Text size="sm" c="dimmed">Chưa có tin nhắn nào</Text>
                                    </Group>
                                ) : (
                                    <Stack gap="md">
                                        {realtimeMessages.map(msg => {
                                            const isMe = msg.senderId === user?.id;
                                            return (
                                                <Box
                                                    key={msg.id}
                                                    style={{
                                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                        maxWidth: '70%',
                                                    }}
                                                >
                                                    <Box
                                                        bg={isMe ? 'blue.6' : 'light-dark(gray.1, dark.5)'}
                                                        c={isMe ? 'white' : 'light-dark(dark, white)'}
                                                        px={16}
                                                        py={10}
                                                        style={{
                                                            borderRadius: 16,
                                                            borderBottomRightRadius: isMe ? 4 : 16,
                                                            borderBottomLeftRadius: isMe ? 16 : 4,
                                                        }}
                                                    >
                                                        <Text size="md">{msg.content}</Text>
                                                    </Box>
                                                    <Text size="xs" c="dimmed" ta={isMe ? 'right' : 'left'} mt={4} style={{ color: 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-3))' }}>
                                                        {dayjs(msg.createdAt).format('HH:mm - DD/MM')}
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </ScrollArea>

                            {/* Input Form */}
                            <Box
                                p="md"
                                style={{
                                    borderTop: '1px solid var(--mantine-color-default-border)',
                                    backgroundColor: 'light-dark(#fff, var(--mantine-color-dark-7))',
                                }}
                            >
                                <form onSubmit={handleSend}>
                                    <Group gap="sm" wrap="nowrap">
                                        <ActionIcon variant="subtle" color="gray" size="lg">
                                            <Iconify icon="solar:gallery-add-bold" width={20} />
                                        </ActionIcon>
                                        <ActionIcon variant="subtle" color="gray" size="lg">
                                            <Iconify icon="ion:attach" width={20} />
                                        </ActionIcon>
                                        <TextInput
                                            placeholder="Nhập tin nhắn..."
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            size="md"
                                            radius="xl"
                                            style={{ flex: 1 }}
                                            styles={{
                                                input: {
                                                    border: '1px solid var(--mantine-color-default-border)',
                                                }
                                            }}
                                        />
                                        <ActionIcon
                                            type="submit"
                                            color="blue"
                                            size="lg"
                                            radius="xl"
                                            variant="filled"
                                            disabled={!text.trim()}
                                        >
                                            <Iconify icon="solar:arrow-up-bold" width={18} />
                                        </ActionIcon>
                                    </Group>
                                </form>
                            </Box>
                        </>
                    ) : (
                        <Group justify="center" align="center" style={{ flex: 1, backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))' }}>
                            <Stack align="center" gap="md">
                                <Box
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        backgroundColor: 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-6))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Iconify icon="solar:chat-round-dots-bold" width={40} color="light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))" />
                                </Box>
                                <Text c="dimmed" size="lg" ta="center" style={{ color: 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-3))' }}>Chọn một khách hàng để bắt đầu trò chuyện</Text>
                            </Stack>
                        </Group>
                    )}
                </Box>
            </Flex>
        </Card>
    );
}
