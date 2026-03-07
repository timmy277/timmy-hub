import { AdminChat } from '@/features/admin/chat/AdminChat';

export const metadata = {
    title: 'Quản lý Trò chuyện | TimmyHub Admin',
};

export default function AdminChatPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 105px)' }}>
            <AdminChat />
        </div>
    );
}
