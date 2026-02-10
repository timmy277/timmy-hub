'use client';

import { useForm, isNotEmpty } from '@mantine/form';
import {
    TextInput,
    Textarea,
    Button,
    Group,
    Stack,
    Box,
    SimpleGrid,
} from '@mantine/core';
import {
    Permission,
    CreatePermissionInput,
} from '@/types/rbac';
import {
    useCreatePermissionMutation,
    useUpdatePermissionMutation,
} from '@/hooks/useRbac';
import { useTranslation } from 'react-i18next';

interface CreateUpdatePermissionProps {
    permission?: Permission;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CreateUpdatePermission({
    permission,
    onSuccess,
    onCancel,
}: CreateUpdatePermissionProps) {
    const { t } = useTranslation();
    const isEdit = !!permission;

    const createMutation = useCreatePermissionMutation();
    const updateMutation = useUpdatePermissionMutation();

    const form = useForm<CreatePermissionInput>({
        initialValues: {
            name: permission?.name || '',
            displayName: permission?.displayName || '',
            description: permission?.description || '',
            module: permission?.module || '',
            action: permission?.action || '',
        },
        validate: {
            name: isNotEmpty(t('validation.required')),
            displayName: isNotEmpty(t('validation.required')),
            module: isNotEmpty(t('validation.required')),
            action: isNotEmpty(t('validation.required')),
        },
    });

    const handleSubmit = (values: CreatePermissionInput) => {
        if (isEdit && permission) {
            updateMutation.mutate(
                { id: permission.id, data: values },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                },
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <Box pos="relative" p="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, md: 2 }}>
                        <TextInput
                            label={t('rbac.permissionName')}
                            placeholder="e.g. users:read"
                            required
                            disabled={isEdit}
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            label={t('rbac.displayName')}
                            placeholder={t('rbac.displayNamePlaceholder')}
                            required
                            {...form.getInputProps('displayName')}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, md: 2 }}>
                        <TextInput
                            label={t('rbac.module')}
                            placeholder="e.g. users"
                            required
                            {...form.getInputProps('module')}
                        />
                        <TextInput
                            label={t('rbac.action')}
                            placeholder="e.g. read, create, update, delete"
                            required
                            {...form.getInputProps('action')}
                        />
                    </SimpleGrid>

                    <Textarea
                        label={t('rbac.description')}
                        placeholder={t('rbac.descriptionPlaceholder')}
                        minRows={3}
                        {...form.getInputProps('description')}
                    />

                    <Group justify="flex-end" mt="xl">
                        {onCancel && (
                            <Button variant="subtle" onClick={onCancel}>
                                {t('common.cancel')}
                            </Button>
                        )}
                        <Button
                            type="submit"
                            loading={createMutation.isPending || updateMutation.isPending}
                        >
                            {isEdit ? t('common.update') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Box>
    );
}
