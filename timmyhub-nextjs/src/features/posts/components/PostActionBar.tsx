'use client';

import { ActionIcon, Stack, Text } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';

interface Props {
    liked: boolean;
    likeCount: number;
    commentCount: number;
    showComments: boolean;
    onLike: () => void;
    onToggleComments: () => void;
    style?: React.CSSProperties;
}

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

export function PostActionBar({ liked, likeCount, commentCount, showComments, onLike, onToggleComments, style }: Props) {
    return (
        <Stack gap="lg" align="center" style={{ position: 'absolute', bottom: 80, ...style }}>
            <Stack gap={2} align="center">
                <ActionIcon size={44} radius="xl" variant="filled"
                    color={liked ? 'red' : undefined}
                    style={{ background: liked ? undefined : 'rgba(60,60,60,0.85)' }}
                    onClick={onLike}>
                    <Iconify icon={liked ? 'solar:heart-bold' : 'solar:heart-linear'} width={22} />
                </ActionIcon>
                <Text size="xs" c="white" fw={600}>{fmt(likeCount)}</Text>
            </Stack>

            <Stack gap={2} align="center">
                <ActionIcon size={44} radius="xl" variant="filled"
                    style={{ background: showComments ? 'rgba(100,100,255,0.7)' : 'rgba(60,60,60,0.85)' }}
                    onClick={onToggleComments}>
                    <Iconify icon="solar:chat-round-dots-bold" width={22} />
                </ActionIcon>
                <Text size="xs" c="white" fw={600}>{fmt(commentCount)}</Text>
            </Stack>

            <Stack gap={2} align="center">
                <ActionIcon size={44} radius="xl" variant="filled" style={{ background: 'rgba(60,60,60,0.85)' }}>
                    <Iconify icon="solar:share-bold" width={22} />
                </ActionIcon>
                <Text size="xs" c="white" fw={600}>Chia sẻ</Text>
            </Stack>
        </Stack>
    );
}
