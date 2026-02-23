'use client';

import { Box, Title, TextInput, Avatar, Button, Stack, Group, Loader, Text } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';

function displayName(profile: { firstName?: string; lastName?: string; displayName?: string } | null | undefined): string {
    if (!profile) return '';
    if (profile.displayName) return profile.displayName;
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
}

export function ProfilePage() {
    const { user, refetchProfile } = useAuth();
    const queryClient = useQueryClient();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayNameVal, setDisplayNameVal] = useState('');

    useEffect(() => {
        if (user?.profile) {
            setFirstName(user.profile.firstName ?? '');
            setLastName(user.profile.lastName ?? '');
            setDisplayNameVal(user.profile.displayName ?? displayName(user.profile));
        }
    }, [user?.profile]);

    const updateMutation = useMutation({
        mutationFn: (data: { firstName?: string; lastName?: string; displayName?: string }) =>
            authService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            refetchProfile();
            notifications.show({ title: 'Thành công', message: 'Đã cập nhật thông tin', color: 'green' });
        },
        onError: (err: { response?: { data?: { message?: string } } }) => {
            notifications.show({
                title: 'Lỗi',
                message: err?.response?.data?.message ?? 'Cập nhật thất bại',
                color: 'red',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            displayName: displayNameVal.trim() || undefined,
        });
    };

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
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <TextInput
                        label="Tên"
                        placeholder="Nhập tên"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />
                    <TextInput
                        label="Tên hiển thị"
                        placeholder="Tên hiển thị (tùy chọn)"
                        value={displayNameVal}
                        onChange={e => setDisplayNameVal(e.target.value)}
                    />

                    <Button
                        type="submit"
                        loading={updateMutation.isPending}
                    >
                        Lưu thay đổi
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
