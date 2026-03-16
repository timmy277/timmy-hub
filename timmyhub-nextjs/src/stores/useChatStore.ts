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
    openChat: (contact: ChatContact) => void;
    closeChat: () => void;
    toggleChat: () => void;
}

export const useChatStore = create<ChatState>(set => ({
    activeChat: null,
    isChatOpen: false,
    openChat: (contact) => set({ activeChat: contact, isChatOpen: true }),
    closeChat: () => set({ isChatOpen: false }),
    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));
