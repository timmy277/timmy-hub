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
    Divider,
    rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Icon } from '@iconify/react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMounted, useMediaQuery } from '@mantine/hooks';
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

/** URL base của BE API để redirect trực tiếp sang OAuth */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function InnerLoginPage() {
    // ===== Hooks & Context =====
    const mounted = useMounted();
    const isMobile = useMediaQuery('(max-width: 576px)');
    const isTablet = useMediaQuery('(min-width: 577px) and (max-width: 992px)');
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
                icon: <Icon icon="tabler:x" width={18} />,
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
            icon: <Icon icon="tabler:check" width={18} />,
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
                height: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? rem(8) : rem(16),
                backgroundColor: 'var(--mantine-color-body)',
                overflow: 'hidden',
            }}
        >
            <Container size={isMobile ? 'xs' : 600} w="100%">
                <Box
                    style={{
                        borderRadius: isMobile ? rem(24) : rem(56),
                        padding: isMobile ? rem(3) : rem(4.8),
                        background:
                            'linear-gradient(180deg, var(--mantine-primary-color-6) 10%, rgba(33, 150, 243, 0) 30%)',
                    }}
                >
                    <Paper
                        radius={isMobile ? rem(21) : rem(53)}
                        p={{ base: 'md', sm: isTablet ? 'lg' : 'xl', md: 50 }}
                        withBorder
                        style={{
                            backgroundColor: 'white',
                            borderColor: 'transparent',
                            boxShadow: 'var(--mantine-shadow-md)',
                        }}
                        className="dark:bg-dark-900!"
                    >
                        <Stack gap={isMobile ? 'md' : 'xl'}>
                            <Box ta="center">
                                <Group justify="center" mb="lg">
                                    <Box
                                        style={{
                                            width: isMobile ? rem(48) : rem(64),
                                            height: isMobile ? rem(48) : rem(64),
                                            borderRadius: 'var(--mantine-radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: isMobile ? rem(24) : rem(32),
                                            background: 'var(--mantine-primary-color-6)',
                                        }}
                                    >
                                        T
                                    </Box>
                                </Group>
                                <Title
                                    order={2}
                                    fw={500}
                                    size={isMobile ? rem(22) : rem(30)}
                                    style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
                                >
                                    Welcome to TimmyHub
                                </Title>
                                <Text c="dimmed" size={isMobile ? 'sm' : 'lg'} mt={5}>
                                    Sign in to continue
                                </Text>
                            </Box>

                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Stack gap="md">
                                    <TextInput
                                        id="login-email"
                                        label="Email"
                                        placeholder="Enter your email"
                                        size={isMobile ? 'sm' : 'md'}
                                        radius="md"
                                        leftSection={<Icon icon="tabler:at" width={16} />}
                                        {...form.getInputProps('email')}
                                    />

                                    <PasswordInput
                                        id="login-password"
                                        label="Password"
                                        placeholder="Enter your password"
                                        size={isMobile ? 'sm' : 'md'}
                                        radius="md"
                                        leftSection={<Icon icon="tabler:lock" width={16} />}
                                        {...form.getInputProps('password')}
                                    />

                                    <Group justify="space-between" mt="sm" wrap="wrap" gap="xs">
                                        <Checkbox
                                            id="login-remember"
                                            label="Remember me"
                                            fw={500}
                                            size={isMobile ? 'xs' : 'sm'}
                                            {...form.getInputProps('remember', { type: 'checkbox' })}
                                        />
                                        <Anchor href="/forgot-password" size="xs" fw={700} c="blue">
                                            Forgot password?
                                        </Anchor>
                                    </Group>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size={isMobile ? 'sm' : 'md'}
                                        radius="md"
                                        mt="sm"
                                        loading={loginMutation.isPending}
                                        rightSection={<Icon icon="tabler:arrow-right" width={18} />}
                                    >
                                        Sign In
                                    </Button>
                                </Stack>
                            </form>

                            <Divider label="hoặc đăng nhập với" labelPosition="center" />

                            <Group grow={!isMobile} gap="sm" wrap="wrap">
                                <Button
                                    component="a"
                                    href={`${API_URL}/auth/google`}
                                    variant="default"
                                    size={isMobile ? 'sm' : 'md'}
                                    radius="md"
                                    leftSection={<Icon icon="material-icon-theme:google" width={18} color="#EA4335" />}
                                    fullWidth={isMobile}
                                >
                                    Google
                                </Button>
                                <Button
                                    component="a"
                                    href={`${API_URL}/auth/facebook`}
                                    variant="default"
                                    size={isMobile ? 'sm' : 'md'}
                                    radius="md"
                                    leftSection={<Icon icon="logos:facebook" width={18} color="#1877F2" />}
                                    fullWidth={isMobile}
                                >
                                    Facebook
                                </Button>
                            </Group>

                            <Text c="dimmed" size="sm" ta="center">
                                Don&apos;t have an account?{' '}
                                <Anchor href="/register" size="sm" fw={700} c="blue">
                                    Register here
                                </Anchor>
                            </Text>
                        </Stack>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
}
