import { create } from 'zustand';

interface PostStore {
    muted: boolean;
    toggleMute: () => void;
}

export const usePostStore = create<PostStore>(set => ({
    muted: true,
    toggleMute: () => set(s => ({ muted: !s.muted })),
}));
