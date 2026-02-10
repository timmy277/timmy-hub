'use client';

import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { TextInput, Textarea, Button, Group, Stack, Title, Paper, Switch } from '@mantine/core';
import { Role, CreateRoleInput } from '@/types/rbac';
import {
    useCreateRoleMutation,
    useAssignPermissionsMutation,
    usePermissions,
} from '@/hooks/useRbac';
import { createRequiredValidator } from '@/utils/validators';
import { PermissionGrid } from './components/PermissionGrid';

interface CreateUpdateRoleProps {
    role?: Role;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateUpdateRole({ role, onSuccess, onCancel }: CreateUpdateRoleProps) {
    // ===== Hooks & Context =====
    const { t } = useTranslation();
    const createRoleMutation = useCreateRoleMutation();
    const assignPermissionsMutation = useAssignPermissionsMutation();
    const { data: permissionsResponse } = usePermissions();

    // ===== Component Logic =====
    const form = useForm<CreateRoleInput>({
        initialValues: {
            name: role?.name || '',
            displayName: role?.displayName || '',
            description: role?.description || '',
            isSystem: role?.isSystem || false,
            permissionNames: role?.permissions?.map(p => p.permission.name) || [],
        },

        validate: {
            name: createRequiredValidator(t, 'rbac.roleName'),
            displayName: createRequiredValidator(t, 'rbac.displayName'),
        },
    });

    // ===== Event Handlers =====
    const handleSubmit = async (values: CreateRoleInput) => {
        if (!!role) {
            // Update role permissions (currently backend only supports assigning permissions)
            await assignPermissionsMutation.mutateAsync({
                roleId: role.id,
                permissionNames: values.permissionNames || [],
            });
            onSuccess();
        } else {
            createRoleMutation.mutate(values, {
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        }
    };

    const isPending = !!role ? assignPermissionsMutation.isPending : createRoleMutation.isPending;

    // ===== Final Render =====
    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <Title order={3} mb="lg">
                {!!role
                    ? t('rbac.updateRole', { name: role.displayName || role.name })
                    : t('rbac.createRole')}
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label={t('rbac.roleName')}
                        placeholder={t('rbac.roleNamePlaceholder')}
                        withAsterisk
                        disabled={!!role}
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        label={t('rbac.displayName')}
                        placeholder={t('rbac.displayNamePlaceholder')}
                        withAsterisk
                        {...form.getInputProps('displayName')}
                    />

                    <Textarea
                        label={t('rbac.description')}
                        placeholder={t('rbac.descriptionPlaceholder')}
                        {...form.getInputProps('description')}
                    />

                    <PermissionGrid
                        permissions={permissionsResponse?.data || []}
                        value={form.values.permissionNames || []}
                        onChange={(val: string[]) => form.setFieldValue('permissionNames', val)}
                    />

                    {!role && (
                        <Switch
                            label={t('rbac.isSystemRole')}
                            description={t('rbac.isSystemRoleDescription')}
                            {...form.getInputProps('isSystem', { type: 'checkbox' })}
                        />
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onCancel}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" loading={isPending}>
                            {!!role ? t('common.update') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}
