'use client';

import { useState, useEffect } from 'react';
import { Popover, ActionIcon, Group, Text, Stack, Avatar, Badge, Box, ScrollArea, UnstyledButton, Button } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/stores/useChatStore';
import { useThemeStore } from '@/stores/useThemeStore';

interface Contact {
    id: string;
    displayName: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount?: number;
}

export function MessageIcon() {
    const { user } = useAuth();
    const router = useRouter();
    const [opened, setOpened] = useState(false);
    const openChat = useChatStore((state) => state.openChat);
    const { primaryColor } = useThemeStore();

    // Query danh sách contacts (tin nhắn)
    const { data: contactsData, isLoading, refetch: refetchContacts } = useQuery({
        queryKey: ['chat-contacts'],
        queryFn: () => chatService.getContacts(),
        enabled: opened && !!user,
    });

    // Query admin để hiển thị chat với admin
    const { data: adminData } = useQuery({
        queryKey: ['chat-admin'],
        queryFn: () => chatService.getAdmin(),
        enabled: !!user,
    });

    // Tính tổng số tin nhắn chưa đọc
    const unreadCount = contactsData?.data?.reduce((acc: number, contact: Contact) => acc + (contact.unreadCount || 0), 0) || 0;

    // Xử lý khi click vào tin nhắn
    const handleMessageClick = (contact: Contact) => {
        setOpened(false);
        openChat({
            id: contact.id,
            name: contact.displayName,
            avatar: contact.avatar
        });
    };

    // Xử lý khi click vào admin chat
    const handleAdminClick = () => {
        setOpened(false);
        if (adminData?.data) {
            openChat({
                id: adminData.data.id,
                name: adminData.data.displayName || 'Admin Hỗ Trợ',
                avatar: adminData.data.avatar
            });
        }
    };

    // Refresh contacts khi mở popover
    useEffect(() => {
        if (opened) {
            refetchContacts();
        }
    }, [opened, refetchContacts]);

    if (!user) return null;

    return (
        <>
            <Popover
                opened={opened}
                onChange={setOpened}
                width={360}
                position="bottom-end"
                shadow="md"
                radius="md"
                withArrow
                withinPortal={false}
            >
                <Popover.Target>
                    <ActionIcon
                        variant="subtle"
                        color={primaryColor}
                        size="lg"
                        radius="md"
                        onClick={() => setOpened((o) => !o)}
                        pos="relative"
                    >
                        <Iconify icon="ri:messenger-fill" width={22} />
                        {unreadCount > 0 && (
                            <Badge
                                size="xs"
                                variant="filled"
                                color="red"
                                style={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -4,
                                    minWidth: 18,
                                    height: 18,
                                    padding: 0,
                                }}
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                    </ActionIcon>
                </Popover.Target>

                <Popover.Dropdown p={0}>
                    <Group justify="space-between" px="md" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                        <Text fw={600}>Tin nhắn</Text>
                        <Button
                            variant="subtle"
                            size="xs"
                            color="gray"
                            onClick={() => router.push('/messages')}
                        >
                            Xem tất cả
                        </Button>
                    </Group>

                    <ScrollArea.Autosize mah={400} type="scroll">
                        {isLoading && (
                            <Text size="sm" ta="center" py="md" c="dimmed">Đang tải...</Text>
                        )}

                        {!isLoading && contactsData?.data?.length === 0 && !adminData?.data && (
                            <Box ta="center" py="xl">
                                <Iconify icon="ph:chat-circle-dots" width={48} color="gray" />
                                <Text size="sm" c="dimmed" mt="md">Không có tin nhắn nào</Text>
                            </Box>
                        )}

                        {!isLoading && contactsData?.data?.map((contact: Contact) => (
                            <UnstyledButton
                                key={contact.id}
                                onClick={() => handleMessageClick(contact)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    width: '100%',
                                    borderBottom: '1px solid var(--mantine-color-gray-1)',
                                    transition: 'background-color 0.2s',
                                    backgroundColor: (contact.unreadCount || 0) > 0 ? 'var(--mantine-color-blue-0)' : 'transparent',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = (contact.unreadCount || 0) > 0 ? 'var(--mantine-color-blue-0)' : 'transparent')}
                            >
                                <Box pos="relative">
                                    <Avatar src={contact.avatar} radius="xl" size="md">
                                        {contact.displayName.charAt(0)}
                                    </Avatar>
                                    {(contact.unreadCount || 0) > 0 && (
                                        <Badge
                                            size="xs"
                                            variant="filled"
                                            color="red"
                                            style={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -4,
                                                minWidth: 16,
                                                height: 16,
                                                padding: 0,
                                            }}
                                        >
                                            {contact.unreadCount}
                                        </Badge>
                                    )}
                                </Box>

                                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="sm" fw={(contact.unreadCount || 0) > 0 ? 700 : 500} truncate>
                                            {contact.displayName}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {formatTime(contact.lastMessageAt)}
                                        </Text>
                                    </Group>
                                    <Text size="sm" c="dimmed" truncate>
                                        {contact.lastMessage || 'Chưa có tin nhắn'}
                                    </Text>
                                </Stack>
                            </UnstyledButton>
                        ))}
                    </ScrollArea.Autosize>

                    {/* Chat với Admin */}
                    {adminData?.data && (
                        <Box style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                            <UnstyledButton
                                onClick={handleAdminClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    width: '100%',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <Avatar src={adminData.data.avatar} radius="xl" size="md" color="blue">
                                    <Iconify icon="ph:user-fill" width={20} />
                                </Avatar>
                                <Stack gap={2} style={{ flex: 1 }}>
                                    <Text size="sm" fw={500}>
                                        {adminData.data.displayName || 'Admin Hỗ Trợ'}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        Nhắn tin cho admin
                                    </Text>
                                </Stack>
                                <Box
                                    className="cursor-pointer p-1 rounded hover:bg-gray-100"
                                    onClick={() => router.push('/messages')}
                                >
                                    <Iconify icon="ph:pencil-simple-bold" width={16} />
                                </Box>
                            </UnstyledButton>
                        </Box>
                    )}
                </Popover.Dropdown>
            </Popover>
        </>
    );
}

function formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}p`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}ngày`;
    return `${Math.floor(diffDays / 7)}tuần`;
}
