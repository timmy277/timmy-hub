import { Socket } from 'socket.io-client';
import { User } from './auth';

export type TChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    sender: { id: string; profile: { displayName: string; avatar: string | null } };
};

export interface IChatHeadProps {
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
}
