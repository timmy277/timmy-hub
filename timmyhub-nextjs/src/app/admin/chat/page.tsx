import { AdminChat } from '@/features/admin/chat/AdminChat';
import { Suspense } from 'react';
import { Loader, Group } from '@mantine/core';

export const metadata = {
    title: 'Quản lý Trò chuyện | TimmyHub Admin',
};

export default function AdminChatPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 105px)' }}>
            <Suspense fallback={<Group justify="center" mt="xl"><Loader /></Group>}>
                <AdminChat />
            </Suspense>
        </div>
    );
}
