'use client';

import { useState } from 'react';
import {
    Button,
    Text,
    Stack,
    Paper,
    Title,
    Container,
    Anchor,
    Box,
    TextInput,
    rem,
    Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import Iconify from '@/components/iconify/Iconify';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useForgotPasswordMutation } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

function getApiErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const apiMsg = axiosError.response?.data?.message;
    if (typeof apiMsg === 'string') return apiMsg;
    if (error instanceof Error) return error.message;
    return fallback;
}

const schema = z.object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
});

export function ForgotPasswordPage() {
    const { t } = useTranslation('common');
    const [emailSent, setEmailSent] = useState(false);
    const forgotPasswordMutation = useForgotPasswordMutation();

    const form = useForm({
        initialValues: { email: '' },
        validate: zodResolver(schema),
    });

    const handleSubmit = async (values: z.infer<typeof schema>) => {
        try {
            await forgotPasswordMutation.mutateAsync(values.email);
            setEmailSent(true);
            notifications.show({
                title: t('auth.forgotPasswordSuccess'),
                message: t('auth.forgotPasswordSuccessMsg'),
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
        } catch (error: unknown) {
            notifications.show({
                title: t('auth.forgotPasswordError'),
                message: getApiErrorMessage(error, t('auth.forgotPasswordErrorMsg')),
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--mantine-spacing-md)',
                backgroundColor: 'var(--mantine-color-body)',
            }}
        >
            <Container size={420} w="100%">
                <Paper
                    radius="md"
                    p={{ base: 'lg', sm: 40 }}
                    withBorder
                    style={{
                        boxShadow: 'var(--mantine-shadow-xl)',
                        borderColor: 'var(--mantine-color-default-border)',
                        borderTop: `${rem(6)} solid var(--mantine-color-blue-6)`,
                    }}
                >
                    {!emailSent ? (
                        <Stack gap="xl">
                            <Box ta="center">
                                <Group justify="center" mb="md">
                                    <Box
                                        style={{
                                            width: rem(48),
                                            height: rem(48),
                                            borderRadius: 'var(--mantine-radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: rem(24),
                                            background:
                                                'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))',
                                        }}
                                    >
                                        T
                                    </Box>
                                </Group>
                                <Title order={2} fw={800}>
                                    {t('auth.forgotPasswordTitle')}
                                </Title>
                                <Text c="dimmed" size="sm" mt={5}>
                                    {t('auth.forgotPasswordDesc')}
                                </Text>
                            </Box>

                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Stack gap="md">
                                    <TextInput
                                        label={t('auth.emailLabel')}
                                        placeholder="your@email.com"
                                        size="md"
                                        radius="md"
                                        leftSection={<Iconify icon="tabler:at" width={16} />}
                                        {...form.getInputProps('email')}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size="lg"
                                        radius="md"
                                        mt="md"
                                        loading={forgotPasswordMutation.isPending}
                                    >
                                        {t('auth.sendResetLink')}
                                    </Button>
                                </Stack>
                            </form>

                            <Anchor href="/login" size="sm" ta="center">
                                <Group gap={4} justify="center">
                                    <Iconify icon="tabler:arrow-left" width={14} />
                                    <Text size="sm">{t('auth.backToLogin')}</Text>
                                </Group>
                            </Anchor>
                        </Stack>
                    ) : (
                        <Stack gap="xl">
                            <Box ta="center">
                                <Title order={2} fw={800} c="green">
                                    {t('auth.checkEmailTitle')}
                                </Title>
                                <Text c="dimmed" size="sm" mt="md">
                                    {t('auth.checkEmailDesc')}{' '}
                                    <strong>{form.values.email}</strong>
                                </Text>
                            </Box>

                            <Text size="sm" c="dimmed" ta="center">
                                {t('auth.noEmailReceived')}{' '}
                                <Anchor onClick={() => setEmailSent(false)}>{t('auth.tryAgain')}</Anchor>
                            </Text>

                            <Button component="a" href="/login" variant="light" fullWidth size="lg">
                                {t('auth.backToLogin')}
                            </Button>
                        </Stack>
                    )}
                </Paper>

                <Text mt="xl" c="dimmed" size="xs" ta="center">
                    {t('auth.copyright')}
                </Text>
            </Container>
        </Box>
    );
}
