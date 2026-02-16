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
import { useRouter } from 'next/navigation';
import { useMounted } from '@mantine/hooks';
import { useLoginMutation } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';

// ===== Validation Schema =====
const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    remember: z.boolean().optional(),
});

export function LoginPage() {
    // ===== Hooks & Context =====
    const mounted = useMounted();
    const setAuthData = useAuthStore(state => state.setAuthData);
    const router = useRouter();
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
        try {
            const response = await loginMutation.mutateAsync(values);
            const { user, device } = response.data;

            // Lưu thông tin người dùng vào Store (Zustand persist)
            setAuthData(user, device);

            // Remember Me logic: Nếu tích chọn thì lưu cookie lâu hơn (30 ngày), ngược lại 7 ngày
            const cookieExpires = values.remember ? 30 : 7;

            // Lưu thông tin vào cookie để Middleware có thể đọc nhanh (cho mục đích routing)
            Cookies.set('user_role', user.role, { expires: cookieExpires });
            Cookies.set('user_permissions', JSON.stringify(user.permissions), {
                expires: cookieExpires,
            });

            notifications.show({
                title: 'Success',
                message: response.message || 'Welcome back! You have successfully logged in.',
                color: 'green',
                icon: <IconCheck size={18} />,
            });

            router.push('/admin');
        } catch (error: unknown) {
            let errorMessage = 'Failed to login. Please check your credentials.';

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
                icon: <IconX size={18} />,
            });
        }
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
