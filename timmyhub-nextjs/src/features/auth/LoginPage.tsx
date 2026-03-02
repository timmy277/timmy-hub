'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import {
    Button,
    Checkbox,
    Text,
    Stack,
    Paper,
    Title,
    Container,
    Group,
    Anchor,
    Box,
    TextInput,
    PasswordInput,
    rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { IconAt, IconLock, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMounted } from '@mantine/hooks';
import { useLoginMutation } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { Suspense } from 'react';
import { LoadingFallback } from '@/components/shared/LoadingFallback';

function extractLoginError(error: unknown): string {
    const fallback = 'Failed to login. Please check your credentials.';
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (typeof msg === 'string') return msg;
    }
    if (error instanceof Error) return error.message;
    return fallback;
}

// ===== Validation Schema =====
const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    remember: z.boolean().optional(),
});

export function LoginPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <InnerLoginPage />
        </Suspense>
    );
}

function InnerLoginPage() {
    // ===== Hooks & Context =====
    const mounted = useMounted();
    const setAuthData = useAuthStore(state => state.setAuthData);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect');
    const loginMutation = useLoginMutation();

    // ===== Form Definition =====
    const form = useForm<z.infer<typeof schema>>({
        initialValues: {
            email: '',
            password: '',
            remember: false,
        },
        validate: zodResolver(schema),
    });

    // ===== Event Handlers =====
    const handleSubmit = async (values: z.infer<typeof schema>) => {
        const cookieExpires = values.remember ? 30 : 7;
        let response: Awaited<ReturnType<typeof loginMutation.mutateAsync>>;
        try {
            response = await loginMutation.mutateAsync(values);
        } catch (error: unknown) {
            notifications.show({
                title: 'Error',
                message: extractLoginError(error),
                color: 'red',
                icon: <IconX size={18} />,
            });
            return;
        }
        const { user, device } = response.data;
        const successMessage = response.message ?? 'Welcome back! You have successfully logged in.';

        setAuthData(user, device);

        Cookies.set('user_role', Array.isArray(user.roles) ? user.roles[0] : (user as { role?: string }).role ?? 'CUSTOMER', { expires: cookieExpires });
        Cookies.set('user_permissions', JSON.stringify(user.permissions), {
            expires: cookieExpires,
        });

        notifications.show({
            title: 'Success',
            message: successMessage,
            color: 'green',
            icon: <IconCheck size={18} />,
        });

        const roles = Array.isArray(user.roles) ? user.roles : [(user as { role?: string }).role ?? 'CUSTOMER'];
        const target =
            redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
                ? redirectTo
                : roles.includes('SELLER')
                    ? '/seller'
                    : roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')
                        ? '/admin'
                        : '/';
        router.push(target);
    };

    // ===== Final Render =====
    if (!mounted) return null;

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
            <Container size={600} w="100%">
                <Box
                    style={{
                        borderRadius: rem(56),
                        padding: rem(4.8),
                        background:
                            'linear-gradient(180deg, var(--mantine-primary-color-6) 10%, rgba(33, 150, 243, 0) 30%)',
                    }}
                >
                    <Paper
                        radius={rem(53)}
                        p={{ base: 'xl', sm: 50 }}
                        withBorder
                        style={{
                            backgroundColor: 'white',
                            borderColor: 'transparent',
                            boxShadow: 'var(--mantine-shadow-md)',
                        }}
                        className="dark:!bg-dark-900"
                    >
                        <Stack gap="xl">
                            <Box ta="center">
                                <Group justify="center" mb="lg">
                                    <Box
                                        style={{
                                            width: rem(64),
                                            height: rem(64),
                                            borderRadius: 'var(--mantine-radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: rem(32),
                                            background: 'var(--mantine-primary-color-6)',
                                        }}
                                    >
                                        T
                                    </Box>
                                </Group>
                                <Title
                                    order={2}
                                    fw={500}
                                    size={rem(30)}
                                    style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
                                >
                                    Welcome to TimmyHub
                                </Title>
                                <Text c="dimmed" size="lg" mt={5}>
                                    Sign in to continue
                                </Text>
                            </Box>

                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Stack gap="md">
                                    <TextInput
                                        id="login-email"
                                        label="Email"
                                        placeholder="Enter your email"
                                        size="md"
                                        radius="md"
                                        leftSection={<IconAt size={16} stroke={1.5} />}
                                        {...form.getInputProps('email')}
                                    />

                                    <PasswordInput
                                        id="login-password"
                                        label="Password"
                                        placeholder="Enter your password"
                                        size="md"
                                        radius="md"
                                        leftSection={<IconLock size={16} stroke={1.5} />}
                                        {...form.getInputProps('password')}
                                    />

                                    <Group justify="space-between" mt="sm">
                                        <Checkbox
                                            id="login-remember"
                                            label="Remember me"
                                            fw={500}
                                            {...form.getInputProps('remember', { type: 'checkbox' })}
                                        />
                                        <Anchor href="/forgot-password" size="sm" fw={700} c="blue">
                                            Forgot password?
                                        </Anchor>
                                    </Group>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size="md"
                                        radius="md"
                                        mt="md"
                                        loading={loginMutation.isPending}
                                        rightSection={<IconArrowRight size={18} />}
                                    >
                                        Sign In
                                    </Button>
                                </Stack>
                            </form>

                            <Text c="dimmed" size="sm" ta="center">
                                Don&apos;t have an account?{' '}
                                <Anchor href="/register" size="sm" fw={700} c="blue">
                                    Register here
                                </Anchor>
                            </Text>
                        </Stack>
                    </Paper>
                </Box>
                <Text mt="xl" c="dimmed" size="xs" ta="center">
                    &copy; 2026 TimmyHub. Secure Authentication.
                </Text>
            </Container>
        </Box>
    );
}
