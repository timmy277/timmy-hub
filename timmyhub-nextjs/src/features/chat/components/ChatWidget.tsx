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

export function ChatWidget() {
    const { user, isAuthenticated } = useAuth();
    const [opened, setOpened] = useState(false);
    
    // Fetch Admin Info (chỉ gọi khi bật chat && user login)
    const { data: adminRes, isLoading: isAdminLoading } = useQuery({
        queryKey: QUERY_KEYS.CHAT_ADMIN,
        queryFn: () => chatService.getAdmin(),
        enabled: opened && isAuthenticated && !!user,
        staleTime: 5 * 60 * 1000,
    });
    const admin = adminRes?.data || null;

    // Fetch Messages từ HTTP API
    const { data: messagesRes, isLoading: isMessagesLoading } = useQuery({
        queryKey: QUERY_KEYS.CHAT_MESSAGES(admin?.id || ''),
        queryFn: () => chatService.getMessages(admin!.id, { limit: 50 }),
        enabled: opened && !!admin?.id,
        staleTime: 60 * 1000,
    });
    const initialMessages = useMemo(() => messagesRes?.data || [], [messagesRes?.data]);

    // State lưu tất cả tin nhắn (vừa lấy từ API vừa sinh ra real-time)
    const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
    
    // Cập nhật state nội bộ khi có data từ query
    useEffect(() => {
        if (initialMessages.length > 0) {
            setRealtimeMessages(initialMessages);
        }
    }, [initialMessages]);

    const loading = isAdminLoading || isMessagesLoading;
    
    const [text, setText] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Init socket
    useEffect(() => {
        if (!opened || !isAuthenticated || !user) return;
        const socket = io(`${SOCKET_URL}/chat`, {
            auth: { token: Cookies.get('access_token') },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to chat socket');
        });

        socket.on('connect_error', (err) => {
             console.error('Socket connect_error:', err);
        });

        socket.on('exception', (err) => {
             console.error('Socket exception:', err);
        });

        socket.on('chat:receive', (msg: ChatMessage) => {
             setRealtimeMessages(prev => {
                 if (prev.some(m => m.id === msg.id)) return prev;
                 return [...prev, msg];
             });
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [opened, isAuthenticated, user]);

    // Cuộn xuống nhắn tin
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [realtimeMessages, opened]);

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        const content = text.trim();
        if (!content || !admin || !socketRef.current) return;
        
        socketRef.current.emit('chat:send', {
            receiverId: admin.id,
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

    if (!user || user.roles.includes(UserRole.ADMIN)) {
        // Tạm thời ẩn widget với khách (chưa login) hoặc nếu chính mình là admin thì cũng ẩn 
        // Admin sau này sẽ có panel Messages riêng
        return null;
    }

    return (
        <Box style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
            <Popover opened={opened} onChange={setOpened} position="top-end" withArrow shadow="md" withinPortal={false}>
                <Popover.Target>
                    <ActionIcon 
                        size={56} 
                        radius="xl" 
                        color="blue.6" 
                        variant="filled" 
                        onClick={() => setOpened(o => !o)}
                        style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    >
                        {opened ? (
                           <IconPath name="x" size={24} color="currentColor" />
                        ) : (
                           <IconPath name="message-circle" size={24} color="currentColor" />
                        )}
                    </ActionIcon>
                </Popover.Target>

                <Popover.Dropdown p={0} style={{ width: 340, borderRadius: 16, overflow: 'hidden' }}>
                    {/* Header */}
                    <Box bg="blue.6" c="white" p="md">
                        <Group gap="sm">
                            <Avatar src={admin?.avatar} radius="xl" color="blue.2">
                                {admin?.displayName?.charAt(0) || 'A'}
                            </Avatar>
                            <Box>
                                <Text fw={600} size="sm">{admin?.displayName || 'Admin Hỗ Trợ'}</Text>
                                <Text size="xs" opacity={0.8}>Chúng tôi sẽ trả lời sớm nhất!</Text>
                            </Box>
                        </Group>
                    </Box>

                    {/* Chat Area */}
                    <ScrollArea h={320} p="md" viewportRef={scrollRef}>
                        {loading ? (
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
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <Box key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
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

                    {/* Input */}
                    <Box p="xs" style={{ borderTop: '1px solid #f1f3f5' }}>
                        <form onSubmit={handleSend}>
                            <TextInput
                                placeholder="Nhập tin nhắn..."
                                value={text}
                                onChange={e => setText(e.target.value)}
                                disabled={!admin}
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
        </Box>
    );
}
