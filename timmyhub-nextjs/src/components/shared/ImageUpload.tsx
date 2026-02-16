'use client';

import { Group, Text, rem, Avatar, Stack, Box, Paper, ActionIcon, LoadingOverlay } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fileService } from '@/services/file.service';
import { notifications } from '@mantine/notifications';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleDrop = async (files: FileWithPath[]) => {
        if (files.length === 0) return;
        
        try {
            setLoading(true);
            const response = await fileService.upload(files[0]);
            onChange(response.url);
            notifications.show({
                title: t('common.uploadSuccess', { defaultValue: 'Tải lên thành công' }),
                message: t('common.imageUploaded', { defaultValue: 'Ảnh đã được tải lên máy chủ' }),
                color: 'green',
            });
        } catch (error: any) {
            console.error('Upload failed:', error);
            notifications.show({
                title: t('common.uploadFailed', { defaultValue: 'Tải lên thất bại' }),
                message: error.response?.data?.message || error.message || t('common.uploadError', { defaultValue: 'Có lỗi xảy ra khi tải ảnh' }),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="xs">
            {label && (
                <Text size="sm" fw={500}>
                    {label}
                </Text>
            )}
            
            <Box pos="relative">
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
                
                {value ? (
                    <Paper withBorder p="xs" pos="relative" style={{ width: 'fit-content' }}>
                        <Stack align="center" gap="xs">
                            <Avatar src={value} size={120} radius="md" />
                            <ActionIcon 
                                variant="filled" 
                                color="red" 
                                size="sm" 
                                pos="absolute" 
                                top={-10} 
                                right={-10}
                                onClick={() => onChange('')}
                                radius="xl"
                            >
                                <IconX size={12} />
                            </ActionIcon>
                        </Stack>
                    </Paper>
                ) : (
                    <Dropzone
                        onDrop={handleDrop}
                        maxSize={5 * 1024 ** 2} // 5MB matching BE
                        accept={IMAGE_MIME_TYPE}
                        multiple={false}
                    >
                        <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload
                                    style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconPhoto
                                    style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                    stroke={1.5}
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
            </Box>
        </Stack>
    );
}
