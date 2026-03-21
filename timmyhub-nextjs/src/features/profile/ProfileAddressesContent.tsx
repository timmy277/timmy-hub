/**
 * Quản lý địa chỉ giao hàng trong profile (CRUD + đặt mặc định)
 */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Alert,
    Badge,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Title,
    Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/constants';
import { addressService } from '@/services/address.service';
import { useAuth } from '@/hooks/useAuth';
import type { Address, CreateAddressDto } from '@/types/address';
import Iconify from '@/components/iconify/Iconify';
import { AddressFormModal } from '@/features/profile/components/AddressFormModal';

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    const ax = err as { response?: { data?: { message?: string } } };
    const apiMessage = ax.response?.data?.message;
    if (typeof apiMessage === 'string') return apiMessage;
    return 'Error';
}

function formatAddressLines(a: Address): string {
    const line2 = [a.ward, a.district, a.city].filter(Boolean).join(', ');
    return [a.addressLine1, a.addressLine2, line2].filter(Boolean).join(', ');
}

export function ProfileAddressesContent() {
    const { t } = useTranslation('common');
    const { user } = useAuth();
    const qc = useQueryClient();
    const [opened, { open, close }] = useDisclosure(false);
    const [editing, setEditing] = useState<Address | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.MY_ADDRESSES,
        queryFn: async () => {
            const res = await addressService.list();
            return res.data ?? [];
        },
    });

    const createMutation = useMutation({
        mutationFn: (dto: CreateAddressDto) => addressService.create(dto),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_ADDRESSES });
            notifications.show({ title: t('common.success'), message: t('common.saved'), color: 'green' });
            closeModal();
        },
        onError: (err: unknown) => {
            notifications.show({ title: t('common.error'), message: getErrorMessage(err), color: 'red' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: CreateAddressDto }) => addressService.update(id, dto),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_ADDRESSES });
            notifications.show({ title: t('common.success'), message: t('common.saved'), color: 'green' });
            closeModal();
        },
        onError: (err: unknown) => {
            notifications.show({ title: t('common.error'), message: getErrorMessage(err), color: 'red' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => addressService.remove(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_ADDRESSES });
            notifications.show({ title: t('common.success'), message: t('common.delete'), color: 'green' });
        },
        onError: (err: unknown) => {
            notifications.show({ title: t('common.error'), message: getErrorMessage(err), color: 'red' });
        },
    });

    const defaultMutation = useMutation({
        mutationFn: (id: string) => addressService.setDefault(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_ADDRESSES });
            notifications.show({ title: t('common.success'), message: t('common.saved'), color: 'green' });
        },
        onError: (err: unknown) => {
            notifications.show({ title: t('common.error'), message: getErrorMessage(err), color: 'red' });
        },
    });

    function closeModal(): void {
        setEditing(null);
        close();
    }

    function openCreate(): void {
        setEditing(null);
        open();
    }

    function openEdit(addr: Address): void {
        setEditing(addr);
        open();
    }

    async function handleSaveAddress(dto: CreateAddressDto): Promise<void> {
        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, dto });
        } else {
            await createMutation.mutateAsync(dto);
        }
    }

    const addresses = data ?? [];

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={3}>{t('addresses.title')}</Title>
                    <Text c="dimmed" size="sm">
                        {t('addresses.subtitle')}
                    </Text>
                </div>
                <Button leftSection={<Iconify icon="tabler:plus" width={18} />} onClick={openCreate}>
                    {t('addresses.addNew')}
                </Button>
            </Group>

            {error && (
                <Alert color="red" title={t('common.error')}>
                    {getErrorMessage(error)}
                </Alert>
            )}

            {isLoading ? (
                <Group justify="center" py="xl">
                    <Loader />
                </Group>
            ) : addresses.length === 0 ? (
                <Paper p="xl" withBorder>
                    <Text c="dimmed" ta="center">
                        {t('addresses.empty')}
                    </Text>
                    <Group justify="center" mt="md">
                        <Button onClick={openCreate}>{t('addresses.addNew')}</Button>
                    </Group>
                </Paper>
            ) : (
                <Stack gap="md">
                    {addresses.map(addr => (
                        <Paper
                            key={addr.id}
                            p="md"
                            withBorder
                            className={
                                addr.isDefault
                                    ? 'border-[#238be7] bg-[#238be7]/5 dark:bg-[#238be7]/10'
                                    : ''
                            }
                        >
                            <Group justify="space-between" align="flex-start" wrap="wrap">
                                <Stack gap={4} style={{ flex: 1, minWidth: 240 }}>
                                    <Group gap="xs">
                                        <Text fw={700}>
                                            {addr.fullName}{' '}
                                            <Text span c="dimmed" fw={400} size="sm">
                                                ({addr.phone})
                                            </Text>
                                        </Text>
                                        {addr.isDefault && (
                                            <Badge color="blue" variant="light">
                                                {t('addresses.defaultBadge')}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                        {formatAddressLines(addr)}
                                    </Text>
                                    {addr.label && (
                                        <Text size="xs" c="dimmed">
                                            {addr.label}
                                        </Text>
                                    )}
                                </Stack>
                                <Group gap="xs">
                                    {!addr.isDefault && (
                                        <Button
                                            variant="light"
                                            size="xs"
                                            onClick={() => defaultMutation.mutate(addr.id)}
                                            loading={defaultMutation.isPending}
                                        >
                                            {t('addresses.setDefault')}
                                        </Button>
                                    )}
                                    <Button variant="light" size="xs" onClick={() => openEdit(addr)}>
                                        {t('common.edit')}
                                    </Button>
                                    <Button
                                        variant="light"
                                        color="red"
                                        size="xs"
                                        onClick={() => {
                                            if (window.confirm(t('addresses.confirmDelete'))) {
                                                deleteMutation.mutate(addr.id);
                                            }
                                        }}
                                        loading={deleteMutation.isPending}
                                    >
                                        {t('addresses.delete')}
                                    </Button>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            )}

            <AddressFormModal
                key={editing?.id ?? 'new-address'}
                opened={opened}
                onClose={closeModal}
                editing={editing}
                onSave={handleSaveAddress}
                isSaving={createMutation.isPending || updateMutation.isPending}
                user={user}
            />
        </Stack>
    );
}
