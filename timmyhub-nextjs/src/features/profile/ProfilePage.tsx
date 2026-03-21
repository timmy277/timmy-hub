'use client';

import {
    Box,
    Button,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { JSX, useState } from 'react';
import { User } from '@/types/auth';
import { QUERY_KEYS } from '@/constants';
import { useTranslation } from 'react-i18next';

function displayName(
    profile: { firstName?: string; lastName?: string; displayName?: string } | null | undefined,
): string {
    if (!profile) return '';
    if (profile.displayName) return profile.displayName;
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
}

interface ProfileFormProps {
    user: User;
    refetchProfile: () => void;
}

function ProfileForm({ user, refetchProfile }: ProfileFormProps): JSX.Element {
    const { t } = useTranslation();
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
            refetchProfile();
            notifications.show({
                title: t('common.success'),
                message: t('profile.profileUpdated'),
                color: 'green',
            });
        },
        onError: (err: { response?: { data?: { message?: string } } }) => {
            const msg = err?.response?.data?.message;
            notifications.show({
                title: t('common.error'),
                message: typeof msg === 'string' ? msg : t('profile.profileUpdateFailed'),
                color: 'red',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        updateMutation.mutate({
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            displayName: form.displayNameVal.trim() || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="xl">
                <Box>
                    <Title order={3} fz={{ base: 22, sm: 26 }} fw={700} className="tracking-tight">
                        {t('profile.personalSection')}
                    </Title>
                    <Text size="sm" c="dimmed" mt={6}>
                        {t('profile.editProfile')}
                    </Text>
                </Box>

                <SimpleGrid cols={{ base: 2, sm: 2 }} spacing={{ base: 'sm', sm: 'md' }}>
                    <TextInput
                        required
                        label={t('userManagement.firstName')}
                        placeholder={t('profile.firstNamePlaceholder')}
                        value={form.firstName}
                        onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                        variant="filled"
                        radius="md"
                        classNames={{
                            input:
                                'border-0 bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-white',
                        }}
                    />
                    <TextInput
                        required
                        label={t('userManagement.lastName')}
                        placeholder={t('profile.lastNamePlaceholder')}
                        value={form.lastName}
                        onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                        variant="filled"
                        radius="md"
                        classNames={{
                            input:
                                'border-0 bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-white',
                        }}
                    />
                </SimpleGrid>

                <TextInput
                    label={t('profile.displayNameLabel')}
                    placeholder={t('profile.displayNamePlaceholder')}
                    value={form.displayNameVal}
                    onChange={e => setForm(prev => ({ ...prev, displayNameVal: e.target.value }))}
                    variant="filled"
                    radius="md"
                    classNames={{
                        input:
                            'border-0 bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 focus:bg-white',
                    }}
                />

                <TextInput
                    label={t('profile.email')}
                    value={user.email ?? ''}
                    readOnly
                    variant="filled"
                    radius="md"
                    classNames={{
                        input:
                            'border-0 cursor-default bg-zinc-100/70 text-zinc-600',
                    }}
                />

                <Group justify="flex-end" mt="md">
                    <Button
                        type="submit"
                        loading={updateMutation.isPending}
                        radius="md"
                        size="md"
                        color="dark"
                        className="min-w-[140px] font-semibold"
                    >
                        {t('profile.saveChanges')}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

export function ProfilePage(): JSX.Element {
    const { t } = useTranslation();
    const { user, refetchProfile } = useAuth();

    if (!user) {
        return (
            <Box py="xl" ta="center">
                <Loader size="sm" color="orange" />
                <Text mt="sm" c="dimmed">
                    {t('common.loading', 'Đang tải...')}
                </Text>
            </Box>
        );
    }

    return <ProfileForm key={user.id} user={user} refetchProfile={refetchProfile} />;
}
