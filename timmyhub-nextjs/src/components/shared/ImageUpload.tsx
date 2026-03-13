'use client';

import { Group, Text, rem, Avatar, Stack, Box, Paper, ActionIcon, LoadingOverlay, SimpleGrid } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import Iconify from '@/components/iconify/Iconify';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fileService } from '@/services/file.service';
import { notifications } from '@mantine/notifications';

function getUploadError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

interface ImageUploadProps {
    value?: string | string[];
    onChange: (url: string | string[]) => void;
    label?: string;
    description?: string;
    multiple?: boolean;
}

export function ImageUpload({ value, onChange, label, description, multiple = false }: ImageUploadProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const values = Array.isArray(value) ? value : value ? [value] : [];

    const handleDrop = async (files: FileWithPath[]) => {
        if (files.length === 0) return;
        setLoading(true);
        let urls: string[] = [];
        try {
            const uploadPromises = files.map(file => fileService.upload(file));
            const results = await Promise.all(uploadPromises);
            urls = results.map(r => r.url);
        } catch (error: unknown) {
            console.error('Upload failed:', error);
            const message = getUploadError(
                error,
                t('common.uploadError', { defaultValue: 'Có lỗi xảy ra khi tải ảnh' }),
            );
            notifications.show({
                title: t('common.uploadFailed', { defaultValue: 'Tải lên thất bại' }),
                message,
                color: 'red',
            });
            setLoading(false);
            return;
        }
        if (multiple) {
            onChange([...values, ...urls]);
        } else {
            onChange(urls[0]);
        }
        notifications.show({
            title: t('common.success', { defaultValue: 'Thành công' }),
            message: t('common.uploadSuccess', { defaultValue: 'Tải lên thành công' }),
            color: 'green',
        });
        setLoading(false);
    };

    const handleRemove = (index: number) => {
        if (multiple) {
            const newValues = [...values];
            newValues.splice(index, 1);
            onChange(newValues);
        } else {
            onChange('');
        }
    };

    return (
        <Stack gap="xs">
            <Box>
                {label && <Text size="sm" fw={500}>{label}</Text>}
                {description && <Text size="xs" c="dimmed">{description}</Text>}
            </Box>

            <Box pos="relative">
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

                <Stack gap="md">
                    {values.length > 0 && (
                        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                            {values.map((url, index) => (
                                <Paper key={url} withBorder p="xs" pos="relative">
                                    <Stack align="center" gap="xs">
                                        <Avatar src={url} size={100} radius="md" />
                                        <ActionIcon
                                            variant="filled"
                                            color="red"
                                            size="sm"
                                            pos="absolute"
                                            top={-10}
                                            right={-10}
                                            onClick={() => handleRemove(index)}
                                            radius="xl"
                                        >
                                            <Iconify icon="solar:close-bold" width={12} />
                                        </ActionIcon>
                                    </Stack>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    )}

                    {(multiple || values.length === 0) && (
                        <Dropzone
                            onDrop={handleDrop}
                            maxSize={5 * 1024 ** 2}
                            accept={IMAGE_MIME_TYPE}
                            multiple={multiple}
                        >
                            <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                                <Dropzone.Accept>
                                    <Iconify
                                        icon="solar:upload-bold"
                                        width={32}
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                    />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <Iconify
                                        icon="solar:close-bold"
                                        width={24}
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                    />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <Iconify
                                        icon="solar:gallery-bold"
                                        width={48}
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                    />
                                </Dropzone.Idle>

                                <Box>
                                    <Text size="sm" inline>
                                        {t('common.dragImageHere', { defaultValue: 'Kéo thả ảnh vào đây hoặc nhấp để chọn' })}
                                    </Text>
                                    <Text size="xs" c="dimmed" inline mt={7}>
                                        {t('common.imageSizeLimit', { defaultValue: 'Dung lượng không quá 5MB' })}
                                    </Text>
                                </Box>
                            </Group>
                        </Dropzone>
                    )}
                </Stack>
            </Box>
        </Stack>
    );
}
