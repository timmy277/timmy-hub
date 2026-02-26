'use client';

import { Box, Title, TextInput, Avatar, Button, Stack, Group, Loader, Text } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { User } from '@/types/auth';

function displayName(profile: { firstName?: string; lastName?: string; displayName?: string } | null | undefined): string {
    if (!profile) return '';
    if (profile.displayName) return profile.displayName;
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
}

interface ProfileFormProps {
    user: User;
    refetchProfile: () => void;
}

function ProfileForm({ user, refetchProfile }: ProfileFormProps) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        firstName: user.profile?.firstName ?? '',
        lastName: user.profile?.lastName ?? '',
        displayNameVal: user.profile?.displayName ?? displayName(user.profile),
    });

    const updateMutation = useMutation({
        mutationFn: (data: { firstName?: string; lastName?: string; displayName?: string }) =>
            authService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            refetchProfile();
            notifications.show({ title: 'Thành công', message: 'Đã cập nhật thông tin', color: 'green' });
        },
        onError: (err: { response?: { data?: { message?: string } } }) => {
            const msg = err?.response?.data?.message;
            notifications.show({
                title: 'Lỗi',
                message: typeof msg === 'string' ? msg : 'Cập nhật thất bại',
                color: 'red',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            displayName: form.displayNameVal.trim() || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md" maw={400}>
                <Group>
                    <Avatar
                        src={user.profile?.avatar}
                        size="lg"
                        radius="xl"
                        color="blue"
                    >
                        {(user.profile?.firstName?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
                    </Avatar>
                    <Box>
                        <Text fw={500}>{displayName(user.profile) || user.email}</Text>
                        <Text size="sm" c="dimmed">{user.email}</Text>
                    </Box>
                </Group>

                <TextInput
                    label="Họ"
                    placeholder="Nhập họ"
                    value={form.firstName}
                    onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
                <TextInput
                    label="Tên"
                    placeholder="Nhập tên"
                    value={form.lastName}
                    onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
                <TextInput
                    label="Tên hiển thị"
                    placeholder="Tên hiển thị (tùy chọn)"
                    value={form.displayNameVal}
                    onChange={e => setForm(prev => ({ ...prev, displayNameVal: e.target.value }))}
                />

                <Button
                    type="submit"
                    loading={updateMutation.isPending}
                >
                    Lưu thay đổi
                </Button>
            </Stack>
        </form>
    );
}

export function ProfilePage() {
    const { user, refetchProfile } = useAuth();

    if (!user) {
        return (
            <Box py="xl" ta="center">
                <Loader size="sm" />
                <Text mt="sm" c="dimmed">Đang tải...</Text>
            </Box>
        );
    }

    return (
        <Box>
            <Title order={3} mb="lg">
                Thông tin cá nhân
            </Title>
            <ProfileForm key={user.id} user={user} refetchProfile={refetchProfile} />
        </Box>
    );
}
