import { create } from 'zustand';

export interface ChatContact {
    id: string;
    name: string;
    avatar: string | null;
}

interface ChatState {
    /** Chat đang được mở */
    activeChat: ChatContact | null;
    /** Trạng thái mở/đóng của chat widget */
    isChatOpen: boolean;
    /** Danh sách các avatar đang bị ẩn (thuộc về user) */
    hiddenAvatars: string[];
    /** Số tin nhắn chưa đọc theo contactId */
    unreadCounts: Record<string, number>;
    openChat: (contact: ChatContact) => void;
    closeChat: () => void;
    toggleChat: () => void;
    /** Ẩn avatar của một contact (avatar bị ẩn khi user click close) */
    hideAvatar: (contactId: string) => void;
    /** Hiện avatar của một contact */
    showAvatar: (contactId: string) => void;
    /** Kiểm tra avatar có đang bị ẩn không */
    isAvatarHidden: (contactId: string) => boolean;
    /** Tăng số tin nhắn chưa đọc (socket event) */
    incrementUnread: (contactId: string) => void;
    /** Reset số tin nhắn chưa đọc */
    resetUnread: (contactId: string) => void;
    /** Lấy số tin nhắn chưa đọc */
    getUnreadCount: (contactId: string) => number;
    /** Set tất cả unread counts từ BE */
    setUnreadCounts: (counts: Record<string, number>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    activeChat: null,
    isChatOpen: false,
    hiddenAvatars: [],
    unreadCounts: {},

    openChat: (contact) => set({ activeChat: contact, isChatOpen: true }),

    closeChat: () => set({ isChatOpen: false }),

    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

    hideAvatar: (contactId) => set((state) => ({
        hiddenAvatars: state.hiddenAvatars.includes(contactId)
            ? state.hiddenAvatars
            : [...state.hiddenAvatars, contactId]
    })),

    showAvatar: (contactId) => set((state) => ({
        hiddenAvatars: state.hiddenAvatars.filter(id => id !== contactId)
    })),

    isAvatarHidden: (contactId) => get().hiddenAvatars.includes(contactId),

    incrementUnread: (contactId) => set((state) => ({
        unreadCounts: {
            ...state.unreadCounts,
            [contactId]: (state.unreadCounts[contactId] || 0) + 1
        }
    })),

    resetUnread: (contactId) => set((state) => ({
        unreadCounts: {
            ...state.unreadCounts,
            [contactId]: 0
        }
    })),

    getUnreadCount: (contactId) => get().unreadCounts[contactId] || 0,

    setUnreadCounts: (counts) => set({ unreadCounts: counts }),
}));
