'use client';

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Select,
    Button,
    Group,
    Stack,
    Title,
    Paper,
    Switch,
} from '@mantine/core';
import { CreateUserInput } from '@/types/user';
import { UserRole } from '@/types/enums';
import { useCreateUserMutation, useUpdateUserMutation } from '@/hooks/useUsers';
import { User } from '@/types/auth';
import { createRequiredValidator, createEmailValidator, createPasswordValidator } from '@/utils/validators';

interface CreateUpdateUserProps {
    user?: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateUpdateUser({ user, onSuccess, onCancel }: CreateUpdateUserProps) {
    const { t } = useTranslation();

    const createUserMutation = useCreateUserMutation();
    const updateUserMutation = useUpdateUserMutation();

    const roleOptions = useMemo(() => [
        { value: UserRole.CUSTOMER, label: t('roles.CUSTOMER') },
        { value: UserRole.SELLER, label: t('roles.SELLER') },
        { value: UserRole.BRAND, label: t('roles.BRAND') },
        { value: UserRole.SHIPPER, label: t('roles.SHIPPER') },
        { value: UserRole.ADMIN, label: t('roles.ADMIN') },
        { value: UserRole.SUPER_ADMIN, label: t('roles.SUPER_ADMIN') },
    ], [t]);

    const form = useForm<CreateUserInput & { phoneNumber?: string }>({
        initialValues: {
            email: user?.email || '',
            password: '',
            firstName: user?.profile?.firstName || '',
            lastName: user?.profile?.lastName || '',
            role: user?.role || UserRole.CUSTOMER,
            isActive: user?.isActive ?? true,
            phoneNumber: user?.phone || '',
        },

        validate: {
            email: createEmailValidator(t, 'userManagement.email'),
            password: createPasswordValidator(t, 'userManagement.password', 6, !!user),
            firstName: createRequiredValidator(t, 'userManagement.firstName'),
            lastName: createRequiredValidator(t, 'userManagement.lastName'),
        },
    });

    // Fix: Add form.setValues to dependencies
    useEffect(() => {
        if (user) {
            form.setValues({
                email: user.email,
                password: '',
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                role: user.role,
                isActive: user.isActive,
                phoneNumber: user.phone || '',
            });
        }
    }, [user?.id, form.setValues, user, form]);

    const handleSubmit = (values: CreateUserInput & { phoneNumber?: string }) => {
        if (!!user) {
            const updateData: Partial<CreateUserInput> = {
                email: values.email,
                firstName: values.firstName,
                lastName: values.lastName,
                role: values.role,
                isActive: values.isActive,
                phoneNumber: values.phoneNumber,
            };

            if (values.password && values.password.trim().length > 0) {
                updateData.password = values.password;
            }

            updateUserMutation.mutate(
                { id: user.id, data: updateData },
                { onSuccess: () => { form.reset(); onSuccess(); } }
            );
        } else {
            createUserMutation.mutate(values, {
                onSuccess: () => { form.reset(); onSuccess(); }
            });
        }
    };

    const isPending = !!user ? updateUserMutation.isPending : createUserMutation.isPending;

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <Title order={3} mb="lg">
                {!!user
                    ? t('userManagement.updateUser', { email: user.email })
                    : t('userManagement.createUser')
                }
            </Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Group grow>
                        <TextInput
                            label={t('userManagement.firstName')}
                            placeholder={t('userManagement.firstName')}
                            withAsterisk
                            {...form.getInputProps('firstName')}
                        />
                        <TextInput
                            label={t('userManagement.lastName')}
                            placeholder={t('userManagement.lastName')}
                            withAsterisk
                            {...form.getInputProps('lastName')}
                        />
                    </Group>

                    <TextInput
                        label={t('userManagement.email')}
                        placeholder={t('userManagement.email')}
                        withAsterisk
                        disabled={!!user}
                        {...form.getInputProps('email')}
                    />

                    <PasswordInput
                        label={t('userManagement.password')}
                        placeholder={!!user ? t('userManagement.passwordOptional') : t('userManagement.password')}
                        withAsterisk={!user}
                        description={!!user ? t('userManagement.passwordUpdateHint') : undefined}
                        {...form.getInputProps('password')}
                    />

                    <TextInput
                        label={t('userManagement.phone')}
                        placeholder={t('userManagement.phone')}
                        {...form.getInputProps('phoneNumber')}
                    />

                    <Select
                        label={t('userManagement.role')}
                        placeholder={t('userManagement.selectRole')}
                        data={roleOptions}
                        allowDeselect={false}
                        withAsterisk
                        {...form.getInputProps('role')}
                    />

                    {!!user && (
                        <Switch
                            label={t('userManagement.accountStatus')}
                            description={form.values.isActive
                                ? t('table.status.active')
                                : t('table.status.inactive')
                            }
                            checked={form.values.isActive}
                            {...form.getInputProps('isActive', { type: 'checkbox' })}
                            color="green"
                        />
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onCancel}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" loading={isPending}>
                            {!!user ? t('common.update') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}
