'use client';

import { useEffect } from 'react';
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

interface CreateUpdateUserProps {
    user?: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateUpdateUser({ user, onSuccess, onCancel }: CreateUpdateUserProps) {
    const { t } = useTranslation();
    const isUpdateMode = !!user;
    
    const createUserMutation = useCreateUserMutation();
    const updateUserMutation = useUpdateUserMutation();

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
            email: (value) => {
                if (!value) return t('validation.required', { field: t('userManagement.email') });
                return /^\S+@\S+$/.test(value) ? null : t('validation.invalidEmail');
            },
            password: (value) => {
                if (isUpdateMode) return null;
                if (!value) return t('validation.required', { field: t('userManagement.password') });
                return value.length < 6 ? t('validation.passwordMinLength', { min: 6 }) : null;
            },
            firstName: (value) => {
                if (!value || value.trim().length === 0) {
                    return t('validation.required', { field: t('userManagement.firstName') });
                }
                return null;
            },
            lastName: (value) => {
                if (!value || value.trim().length === 0) {
                    return t('validation.required', { field: t('userManagement.lastName') });
                }
                return null;
            },
        },
    });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleSubmit = (values: CreateUserInput & { phoneNumber?: string }) => {
        if (isUpdateMode && user) {
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

    const isPending = isUpdateMode ? updateUserMutation.isPending : createUserMutation.isPending;

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <Title order={3} mb="lg">
                {isUpdateMode 
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
                        disabled={isUpdateMode}
                        {...form.getInputProps('email')} 
                    />

                    <PasswordInput 
                        label={t('userManagement.password')} 
                        placeholder={isUpdateMode ? t('userManagement.passwordOptional') : t('userManagement.password')}
                        withAsterisk={!isUpdateMode}
                        description={isUpdateMode ? t('userManagement.passwordUpdateHint') : undefined}
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
                        data={[
                            { value: UserRole.CUSTOMER, label: t('roles.CUSTOMER') },
                            { value: UserRole.SELLER, label: t('roles.SELLER') },
                            { value: UserRole.BRAND, label: t('roles.BRAND') },
                            { value: UserRole.SHIPPER, label: t('roles.SHIPPER') },
                            { value: UserRole.ADMIN, label: t('roles.ADMIN') },
                            { value: UserRole.SUPER_ADMIN, label: t('roles.SUPER_ADMIN') },
                        ]}
                        allowDeselect={false}
                        withAsterisk
                        {...form.getInputProps('role')}
                    />

                    {isUpdateMode && (
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
                            {isUpdateMode ? t('common.update') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}
