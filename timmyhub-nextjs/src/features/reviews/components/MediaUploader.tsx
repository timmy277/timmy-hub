'use client';

/**
 * MediaUploader — Kéo thả hoặc chọn ảnh + video cho review
 * Hỗ trợ: jpeg/png/webp + mp4/mov/webm/quicktime
 * Giới hạn: 5 ảnh + 2 video, max 50MB/file
 * Không dùng CSS module — Mantine + inline style
 */
import { useCallback, useState } from 'react';
import {
    Stack,
    Group,
    Text,
    ActionIcon,
    Progress,
    Box,
    Badge,
    CloseButton,
    Paper,
    SimpleGrid,
    ThemeIcon,
    Loader,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, type FileWithPath, type FileRejection } from '@mantine/dropzone';
import {
    IconUpload,
    IconX,
    IconPhoto,
    IconVideo,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { fileService } from '@/services/file.service';

const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'] as const;
const ACCEPTED_MIME = [...IMAGE_MIME_TYPE, ...VIDEO_MIME_TYPES];
const MAX_SIZE_MB = 50;
const MAX_IMAGES = 5;
const MAX_VIDEOS = 2;

interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    localUrl?: string;
    progress?: number;
    error?: boolean;
}

interface MediaUploaderProps {
    onMediaChange: (images: string[], videos: string[]) => void;
}

const PREVIEW_STYLE: React.CSSProperties = {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    height: 88,
    background: '#f1f3f5',
    flexShrink: 0,
};

const OVERLAY_STYLE: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)',
};

const CLOSE_BTN_STYLE: React.CSSProperties = {
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

function ImagePreview({ item, onRemove }: { item: MediaItem; onRemove: () => void }) {
    const uploading = item.progress !== undefined && item.progress < 100;
    const done = !item.error && !uploading;
    return (
        <Box style={PREVIEW_STYLE}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={item.localUrl ?? item.url}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {uploading && (
                <Box style={OVERLAY_STYLE}>
                    <Stack align="center" gap={2}>
                        <Loader size="xs" color="white" />
                        <Text size="xs" c="white" fw={600}>{item.progress}%</Text>
                    </Stack>
                </Box>
            )}
            {item.error && (
                <Box style={{ ...OVERLAY_STYLE, background: 'rgba(200,0,0,0.6)' }}>
                    <IconX size={16} color="white" />
                </Box>
            )}
            {done && (
                <CloseButton
                    size="xs"
                    radius="xl"
                    style={CLOSE_BTN_STYLE}
                    onClick={onRemove}
                    title="Xóa"
                    c="white"
                />
            )}
        </Box>
    );
}

function VideoPreview({ item, onRemove }: { item: MediaItem; onRemove: () => void }) {
    const uploading = item.progress !== undefined && item.progress < 100;
    const done = !item.error && !uploading;
    return (
        <Box style={PREVIEW_STYLE}>
            {item.localUrl ? (
                <video
                    src={item.localUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    muted
                    playsInline
                />
            ) : (
                <Box style={{ ...PREVIEW_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
                    <IconVideo size={28} color="#ccc" />
                </Box>
            )}
            {/* Video badge */}
            <Badge
                size="xs"
                radius="sm"
                style={{ position: 'absolute', bottom: 4, left: 4 }}
                leftSection={<IconVideo size={10} />}
                color="dark"
                variant="filled"
            >
                Video
            </Badge>
            {uploading && (
                <Box style={OVERLAY_STYLE}>
                    <Stack align="center" gap={2}>
                        <Loader size="xs" color="white" />
                        <Text size="xs" c="white" fw={600}>{item.progress}%</Text>
                    </Stack>
                </Box>
            )}
            {item.error && (
                <Box style={{ ...OVERLAY_STYLE, background: 'rgba(200,0,0,0.6)' }}>
                    <IconX size={16} color="white" />
                </Box>
            )}
            {done && (
                <CloseButton
                    size="xs"
                    radius="xl"
                    style={CLOSE_BTN_STYLE}
                    onClick={onRemove}
                    title="Xóa"
                    c="white"
                />
            )}
        </Box>
    );
}

export function MediaUploader({ onMediaChange }: MediaUploaderProps) {
    const [media, setMedia] = useState<MediaItem[]>([]);

    const currentImages = media.filter(m => m.type === 'image' && !m.error);
    const currentVideos = media.filter(m => m.type === 'video' && !m.error);
    const canAddMore = currentImages.length < MAX_IMAGES || currentVideos.length < MAX_VIDEOS;

    const notifyUpdated = useCallback((updated: MediaItem[]) => {
        const uploaded = updated.filter(m => !m.error && (m.progress === undefined || m.progress === 100));
        onMediaChange(
            uploaded.filter(m => m.type === 'image').map(m => m.url),
            uploaded.filter(m => m.type === 'video').map(m => m.url),
        );
    }, [onMediaChange]);

    const handleDrop = useCallback(
        async (files: FileWithPath[]) => {
            const imgCount = media.filter(m => m.type === 'image' && !m.error).length;
            const vidCount = media.filter(m => m.type === 'video' && !m.error).length;
            const accepted: FileWithPath[] = [];

            for (const file of files) {
                const isVideo = file.type.startsWith('video/');
                if (isVideo && vidCount + accepted.filter(f => f.type.startsWith('video/')).length >= MAX_VIDEOS) {
                    notifications.show({ message: `Tối đa ${MAX_VIDEOS} video`, color: 'orange' });
                    continue;
                }
                if (!isVideo && imgCount + accepted.filter(f => !f.type.startsWith('video/')).length >= MAX_IMAGES) {
                    notifications.show({ message: `Tối đa ${MAX_IMAGES} ảnh`, color: 'orange' });
                    continue;
                }
                accepted.push(file);
            }

            if (!accepted.length) return;

            const pending: MediaItem[] = accepted.map(file => ({
                id: `${Date.now()}-${Math.random()}`,
                url: '',
                type: file.type.startsWith('video/') ? 'video' : 'image',
                localUrl: URL.createObjectURL(file),
                progress: 0,
            }));

            setMedia(prev => [...prev, ...pending]);

            for (let i = 0; i < accepted.length; i++) {
                const file = accepted[i];
                const pendingId = pending[i].id;
                try {
                    const result = await fileService.uploadMedia(file, pct => {
                        setMedia(prev =>
                            prev.map(m => m.id === pendingId ? { ...m, progress: pct } : m),
                        );
                    });
                    setMedia(prev => {
                        const updated = prev.map(m =>
                            m.id === pendingId
                                ? { ...m, url: (result as { url: string }).url, progress: 100 }
                                : m,
                        );
                        notifyUpdated(updated);
                        return updated;
                    });
                } catch {
                    setMedia(prev => {
                        const updated = prev.map(m =>
                            m.id === pendingId ? { ...m, error: true, progress: undefined } : m,
                        );
                        return updated;
                    });
                    notifications.show({
                        title: 'Upload thất bại',
                        message: `Không thể upload ${file.name}`,
                        color: 'red',
                    });
                }
            }
        },
        [media, notifyUpdated],
    );

    const handleRemove = useCallback(
        (id: string) => {
            setMedia(prev => {
                const item = prev.find(m => m.id === id);
                if (item?.localUrl) URL.revokeObjectURL(item.localUrl);
                const updated = prev.filter(m => m.id !== id);
                notifyUpdated(updated);
                return updated;
            });
        },
        [notifyUpdated],
    );

    const handleReject = useCallback((files: FileRejection[]) => {
        for (const { file, errors } of files) {
            const isTooLarge = errors.some(e => e.code === 'file-too-large');
            const isWrongType = errors.some(e => e.code === 'file-invalid-type');
            if (isTooLarge) {
                notifications.show({ message: `${file.name} vượt quá ${MAX_SIZE_MB}MB`, color: 'red' });
            } else if (isWrongType) {
                notifications.show({ message: `${file.name} — định dạng không được hỗ trợ`, color: 'orange' });
            }
        }
    }, []);

    const hasUploading = media.some(m => m.progress !== undefined && m.progress < 100);
    const hasMedia = media.length > 0;

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>
                Ảnh / Video
                <Text span size="xs" c="dimmed" ml={6}>
                    (tùy chọn — tối đa {MAX_IMAGES} ảnh, {MAX_VIDEOS} video, {MAX_SIZE_MB}MB/file)
                </Text>
            </Text>

            {/* Preview grid */}
            {hasMedia && (
                <SimpleGrid cols={5} spacing="xs">
                    {media.map(item =>
                        item.type === 'image' ? (
                            <ImagePreview key={item.id} item={item} onRemove={() => handleRemove(item.id)} />
                        ) : (
                            <VideoPreview key={item.id} item={item} onRemove={() => handleRemove(item.id)} />
                        ),
                    )}
                    {canAddMore && (
                        <Dropzone
                            onDrop={handleDrop}
                            onReject={handleReject}
                            accept={ACCEPTED_MIME}
                            maxSize={MAX_SIZE_MB * 1024 * 1024}
                            disabled={hasUploading}
                            h={88}
                            p={0}
                            radius="md"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Stack align="center" justify="center" gap={4}>
                                <ActionIcon variant="transparent" color="gray" size="sm">
                                    <IconUpload size={16} />
                                </ActionIcon>
                                <Text size="xs" c="dimmed">Thêm</Text>
                            </Stack>
                        </Dropzone>
                    )}
                </SimpleGrid>
            )}

            {/* Empty dropzone */}
            {!hasMedia && (
                <Dropzone
                    onDrop={handleDrop}
                    onReject={handleReject}
                    accept={ACCEPTED_MIME}
                    maxSize={MAX_SIZE_MB * 1024 * 1024}
                    disabled={hasUploading}
                    radius="md"
                >
                    <Group justify="center" gap="xl" wrap="nowrap" py="xs">
                        <Dropzone.Accept>
                            <ThemeIcon size={48} radius="xl" variant="light" color="blue">
                                <IconUpload size={24} />
                            </ThemeIcon>
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <ThemeIcon size={48} radius="xl" variant="light" color="red">
                                <IconX size={24} />
                            </ThemeIcon>
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <Group gap="xs">
                                <ThemeIcon size={40} radius="xl" variant="light" color="gray">
                                    <IconPhoto size={20} />
                                </ThemeIcon>
                                <ThemeIcon size={40} radius="xl" variant="light" color="gray">
                                    <IconVideo size={20} />
                                </ThemeIcon>
                            </Group>
                        </Dropzone.Idle>
                        <Stack gap={4}>
                            <Text size="sm" fw={500}>Kéo thả ảnh/video vào đây</Text>
                            <Text size="xs" c="dimmed">
                                hoặc click để chọn • jpg, png, webp, mp4, mov, webm
                            </Text>
                            <Text size="xs" c="dimmed">Tối đa {MAX_SIZE_MB}MB/file</Text>
                        </Stack>
                    </Group>
                </Dropzone>
            )}

            {/* Progress tổng */}
            {hasUploading && (
                <Paper withBorder p="xs" radius="md">
                    <Group gap="xs">
                        <Loader size="xs" />
                        <Text size="xs" c="dimmed">Đang tải lên...</Text>
                    </Group>
                </Paper>
            )}
        </Stack>
    );
}
