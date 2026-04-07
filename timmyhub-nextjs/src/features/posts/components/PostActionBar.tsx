'use client';

import { Text, Stack } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';

interface Props {
    liked: boolean;
    likeCount: number;
    commentCount: number;
    showComments: boolean;
    muted: boolean;
    onLike: () => void;
    onToggleComments: () => void;
    onToggleMute: () => void;
    style?: React.CSSProperties;
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')}K` : String(n);

const Btn = ({ icon, label, onClick, active }: { icon: string; label?: string; onClick?: () => void; active?: boolean }) => (
    <Stack gap={4} align="center" style={{ cursor: 'pointer' }} onClick={onClick}>
        <Iconify icon={icon} width={32} color={active ? '#1877f2' : 'white'} />
        {label !== undefined && label !== '' && (
            <Text size="xs" c="white" fw={500} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{label}</Text>
        )}
    </Stack>
);

export function PostActionBar({ liked, likeCount, commentCount, showComments, muted, onLike, onToggleComments, onToggleMute, style }: Props) {
    return (
        <Stack gap="xl" align="center" style={{ position: 'absolute', bottom: 80, ...style }}>
            <Btn icon={liked ? 'ph:thumbs-up-fill' : 'ph:thumbs-up'} label={fmt(likeCount)} onClick={onLike} active={liked} />
            <Btn icon="ph:chat-circle" label={fmt(commentCount)} onClick={onToggleComments} active={showComments} />
            <Btn icon="ph:share-fat" label={fmt(0)} />
            <Btn icon={muted ? 'ph:speaker-slash' : 'ph:speaker-high'} onClick={onToggleMute} />
            <Iconify icon="solar:menu-dots-bold" width={28} color="white" style={{ cursor: 'pointer' }} />
        </Stack>
    );
}
