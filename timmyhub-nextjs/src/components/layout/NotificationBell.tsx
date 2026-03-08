'use client';

import { ActionIcon, Indicator, Popover, Text, ScrollArea, Group, Button, UnstyledButton } from '@mantine/core';
import { IconBell, IconShoppingBag, IconMessage, IconInfoCircle, IconStar, IconDiscount } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { useEffect, useState } from 'react';
import type { Notification } from '@/types/notification';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export function NotificationBell() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [opened, setOpened] = useState(false);

    // Lắng nghe socket
    const { newNotification, clearNewNotification } = useNotificationSocket();

    // Query số lượng chưa đọc
    const { data: unreadData, refetch: refetchUnread } = useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: notificationService.getUnreadCount,
    });

    // Query danh sách (lazy fetch khi mở - tạm dùng refetch khi cần)
    const { data: listData, isLoading, refetch: refetchList } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getMyNotifications(1, 10),
        enabled: opened, // Chỉ query khi click mở chuông
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    // Cập nhật khi có Realtime Notification rớt vào mâm
    useEffect(() => {
        if (newNotification) {
            // Có thông báo mới tới -> Tải lại bộ số & danh sách
            refetchUnread();
            if (opened) refetchList();
            clearNewNotification(); // Gọi xong dọn dẹp biến để đón tín hiệu kế tiếp
        }
    }, [newNotification, clearNewNotification, opened, refetchList, refetchUnread]);

    const handleNotificationClick = (item: Notification) => {
        if (!item.isRead) {
            markAsReadMutation.mutate(item.id);
        }
        setOpened(false);
        if (item.link) {
            router.push(item.link);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return <IconShoppingBag size={20} className="text-blue-500" />;
            case 'MESSAGE': return <IconMessage size={20} className="text-green-500" />;
            case 'REVIEW': return <IconStar size={20} className="text-orange-500" />;
            case 'PROMOTION': return <IconDiscount size={20} className="text-pink-500" />;
            default: return <IconInfoCircle size={20} className="text-gray-500" />;
        }
    };

    const unreadCount = unreadData?.count || 0;

    return (
        <Popover opened={opened} onChange={setOpened} width={360} position="bottom-end" shadow="md" withArrow>
            <Popover.Target>
                <Indicator
                    inline
                    size={16}
                    offset={4}
                    color="red"
                    label={unreadCount > 99 ? '99+' : unreadCount}
                    disabled={unreadCount === 0}
                >
                    <ActionIcon 
                        variant={opened ? "light" : "subtle"} 
                        size="lg" 
                        radius="md" 
                        onClick={() => setOpened((o) => !o)}
                    >
                        <IconBell size={22} stroke={1.5} />
                    </ActionIcon>
                </Indicator>
            </Popover.Target>

            <Popover.Dropdown p={0}>
                <Group justify="space-between" px="md" py="xs" className="border-b border-gray-100 dark:border-gray-800">
                    <Text fw={600}>Thông báo</Text>
                    {unreadCount > 0 && (
                        <Button
                            variant="subtle"
                            size="xs"
                            color="gray"
                            onClick={() => markAllAsReadMutation.mutate()}
                            loading={markAllAsReadMutation.isPending}
                        >
                            Đánh dấu đã đọc tất cả
                        </Button>
                    )}
                </Group>

                <ScrollArea.Autosize mah={400} type="scroll" className="p-2">
                    {isLoading && <Text size="sm" ta="center" py="md" c="dimmed">Đang tải...</Text>}
                    
                    {!isLoading && listData?.notifications.length === 0 && (
                        <Text size="sm" ta="center" py="md" c="dimmed">Bạn không có thông báo nào.</Text>
                    )}

                    {!isLoading && listData?.notifications.map((notif: Notification) => (
                        <UnstyledButton
                            key={notif.id}
                            className={`w-full p-2 mb-1 rounded-md transition-colors ${notif.isRead ? 'hover:bg-gray-50 dark:hover:bg-gray-900' : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40'}`}
                            onClick={() => handleNotificationClick(notif)}
                        >
                            <Group wrap="nowrap" align="flex-start" gap="sm">
                                <div className={`p-2 rounded-full ${notif.isRead ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-800 shadow-xs'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <Text size="sm" fw={notif.isRead ? 500 : 700} lineClamp={1}>
                                        {notif.title}
                                    </Text>
                                    <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                                        {notif.content}
                                    </Text>
                                    <Text size="xs" c="dimmed" mt={4} className="opacity-70">
                                        {dayjs(notif.createdAt).fromNow()}
                                    </Text>
                                </div>
                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
                            </Group>
                        </UnstyledButton>
                    ))}
                </ScrollArea.Autosize>
            </Popover.Dropdown>
        </Popover>
    );
}
