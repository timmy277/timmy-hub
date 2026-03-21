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
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { chatService } from '@/services/chat.service';
import { QUERY_KEYS } from '@/constants';
import { IconPath } from '@/components/icons/IconPath';
import { IChatHeadProps, TChatMessage } from '@/types/chat';

export function SingleChat({
    contactId,
    contactName,
    contactAvatar,
    isMain,
    opened,
    onToggle,
    onCloseChat,
    socket,
    currentUser,
    defaultAdminId,
    mainIcon,
    hideAvatar
}: IChatHeadProps) {
    const [isHovered, setIsHovered] = useState(false);

    const { data: messagesRes, isLoading: isMessagesLoading } = useQuery({
        queryKey: QUERY_KEYS.CHAT_MESSAGES(contactId),
        queryFn: () => chatService.getMessages(contactId, { limit: 50 }),
        enabled: opened && !!contactId,
        staleTime: 60 * 1000,
    });

    const initialMessages = useMemo(() => messagesRes?.data || [], [messagesRes?.data]);
    const [realtimeMessages, setRealtimeMessages] = useState<TChatMessage[]>([]);
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialMessages.length > 0) {
            setRealtimeMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        if (!socket || !opened) return;
        const handleReceive = (msg: TChatMessage) => {
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
        }, (res: { status: string; message: TChatMessage }) => {
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

    // Xử lý đóng chat - đóng khung chat VÀ ẩn avatar (giống Facebook)
    const handleCloseChat = (e: React.MouseEvent) => {
        e.stopPropagation();
        hideAvatar(contactId);
        if (onCloseChat) onCloseChat();
    };

    // Xử lý click avatar/button - toggle mở/đóng khung chat
    const handleAvatarClick = () => {
        if (opened) {
            // Nếu đang mở thì đóng lại (không ẩn avatar)
            onToggle();
        } else {
            // Nếu đang đóng thì mở ra
            onToggle();
        }
    };

    return (
        <>
            {/* Avatar Button với hover effect - giống Facebook */}
            <Box
                pos="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ zIndex: opened ? 9998 : 9999, pointerEvents: 'auto' }}
            >
                <ActionIcon
                    size={56}
                    radius="xl"
                    color={isMain ? "blue.6" : "gray.1"}
                    variant="filled"
                    onClick={handleAvatarClick}
                    style={{
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease'
                    }}
                >
                    {isMain ? (
                        mainIcon ? mainIcon : <IconPath name="message-circle" size={24} color="currentColor" />
                    ) : (
                        <Avatar src={contactAvatar} radius="xl" size={56}>
                            {contactName.charAt(0) || 'A'}
                        </Avatar>
                    )}
                </ActionIcon>

                {/* Icon close hiện khi hover - giống Facebook Messenger */}
                {isHovered && !isMain && (
                    <Box
                        pos="absolute"
                        top={-4}
                        right={-4}
                        style={{ zIndex: 10001, pointerEvents: 'auto' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCloseChat(e);
                        }}
                    >
                        <ActionIcon
                            size={20}
                            radius="xl"
                            color="dark"
                            variant="filled"
                            style={{
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                cursor: 'pointer'
                            }}
                        >
                            <IconPath name="x" size={12} color="white" />
                        </ActionIcon>
                    </Box>
                )}
            </Box>

            <Popover
                opened={opened}
                position="left-end"
                offset={16}
                shadow="md"
                withinPortal={false}
            >
                <Popover.Target>
                    <Box style={{ position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, pointerEvents: 'none' }} />
                </Popover.Target>

                <Popover.Dropdown p={0} style={{ width: 340, borderRadius: 16, overflow: 'hidden', zIndex: 9999 }}>
                    <Box bg="blue.6" c="white" p="md" pos="relative">
                        <Group gap="sm" wrap="nowrap">
                            <Avatar src={contactAvatar} radius="xl" color="blue.2">
                                {contactName.charAt(0) || 'A'}
                            </Avatar>
                            <Box style={{ flex: 1, minWidth: 0 }}>
                                <Group gap={6} align="center">
                                    <Text fw={600} size="sm" truncate>{contactName}</Text>
                                    {(contactId === defaultAdminId) && (
                                        <Box bg="red.1" c="red.6" px={4} py={0} style={{ borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            ADMIN
                                        </Box>
                                    )}
                                </Group>
                                <Text size="xs" opacity={0.8} truncate>{(contactId === defaultAdminId) ? 'Chúng tôi sẽ trả lời sớm nhất!' : 'TimmyHub'}</Text>
                            </Box>
                        </Group>

                        <ActionIcon
                            size={24}
                            radius="xl"
                            color="dark"
                            variant="filled"
                            pos="absolute"
                            top={8}
                            right={8}
                            style={{
                                opacity: 0.8,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onClick={handleCloseChat}
                        >
                            <IconPath name="x" size={14} color="white" />
                        </ActionIcon>
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
        </>
    );
}
