'use client';

import { useState } from 'react';
import { Stack, TextInput, Button, Group, Text, Box, ActionIcon, Image, Progress, Paper, SimpleGrid } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import Iconify from '@/components/iconify/Iconify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { fileService } from '@/services/file.service';
import { notifications } from '@mantine/notifications';
import { PostRichTextEditor } from './RichTextEditor';
import type { CreatePostInput } from '@/types/post';

interface UploadedMedia { url: string; type: 'image' | 'video'; name: string; }

export function CreatePostForm({ onSuccess }: { onSuccess?: () => void }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [medias, setMedias] = useState<UploadedMedia[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const createMutation = useMutation({
        mutationFn: (data: CreatePostInput) => postService.create(data),
        onSuccess: () => {
            notifications.show({ message: 'Đã đăng bài thành công', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['posts-feed'] });
            queryClient.invalidateQueries({ queryKey: ['posts-mine'] });
            onSuccess?.();
        },
        onError: () => notifications.show({ message: 'Đăng bài thất bại', color: 'red' }),
    });

    const handleUpload = async (files: File[]) => {
        setUploading(true);
        setUploadProgress(0);
        const results: UploadedMedia[] = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const res = await fileService.uploadMedia(files[i]);
                results.push({ url: res.url, type: res.type as 'image' | 'video', name: files[i].name });
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            } catch {
                notifications.show({ message: `Upload ${files[i].name} thất bại`, color: 'red' });
            }
        }
        setMedias(prev => [...prev, ...results]);
        setUploading(false);
    };

    const handleSubmit = () => {
        if (!title.trim()) { notifications.show({ message: 'Vui lòng nhập tiêu đề', color: 'orange' }); return; }
        const videos = medias.filter(m => m.type === 'video');
        const images = medias.filter(m => m.type === 'image').map(m => m.url);
        createMutation.mutate({
            title: title.trim(),
            content: content || undefined,
            videoUrl: videos[0]?.url,
            thumbnailUrl: images[0],
            images,
            status: 'PUBLISHED',
        });
    };

    return (
        <Stack gap="md">
            <TextInput
                label="Tiêu đề" placeholder="Tiêu đề bài đăng..." value={title}
                onChange={e => setTitle(e.currentTarget.value)} required maxLength={200}
                rightSection={<Text size="xs" c="dimmed">{title.length}/200</Text>}
                rightSectionWidth={50}
            />

            <Box>
                <Text size="sm" fw={500} mb="xs">Nội dung</Text>
                <PostRichTextEditor value={content} onChange={setContent} placeholder="Mô tả sản phẩm, ưu đãi..." />
            </Box>

            <Box>
                <Text size="sm" fw={500} mb="xs">Ảnh / Video</Text>
                <Dropzone
                    onDrop={handleUpload}
                    accept={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.webp, 'video/mp4', 'video/quicktime', 'video/webm']}
                    maxSize={50 * 1024 * 1024} loading={uploading} disabled={uploading}
                >
                    <Group justify="center" gap="xs" py="md">
                        <Iconify icon="solar:upload-bold" width={24} style={{ opacity: 0.4 }} />
                        <Text size="sm" c="dimmed">Kéo thả hoặc click để upload (tối đa 50MB)</Text>
                    </Group>
                </Dropzone>
                {uploading && <Progress value={uploadProgress} mt="xs" animated />}
            </Box>

            {medias.length > 0 && (
                <SimpleGrid cols={4} spacing="xs">
                    {medias.map((m, i) => (
                        <Box key={i} pos="relative" style={{ aspectRatio: '1' }}>
                            <Paper radius="sm" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
                                {m.type === 'video' ? (
                                    <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} controls muted playsInline />
                                ) : (
                                    <Image src={m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </Paper>
                            <ActionIcon
                                pos="absolute" top={-8} right={-8}
                                size="sm" color="red" variant="filled" radius="xl"
                                style={{ zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                                onClick={() => setMedias(prev => prev.filter((_, j) => j !== i))}
                            >
                                <Iconify icon="solar:close-bold" width={12} />
                            </ActionIcon>
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            <Group justify="flex-end">
                <Button onClick={handleSubmit} loading={createMutation.isPending} disabled={!title.trim() || uploading}
                    leftSection={<Iconify icon="solar:send-bold" width={16} />}>
                    Đăng bài
                </Button>
            </Group>
        </Stack>
    );
}
