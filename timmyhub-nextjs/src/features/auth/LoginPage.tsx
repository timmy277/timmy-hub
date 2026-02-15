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

    // ===== Component Logic =====

    // ===== Event Handlers =====
    const handleSubmit = async (values: z.infer<typeof schema>) => {
        try {
            const response = await loginMutation.mutateAsync(values);
            const { user, device } = response.data;

            // Lưu thông tin người dùng vào Store (Zustand persist)
            setAuthData(user, device);

            // Lưu thông tin vào cookie không HttpOnly để Middleware có thể đọc nhanh (cho mục đích routing)
            Cookies.set('user_role', user.role, { expires: 7 });
            Cookies.set('user_permissions', JSON.stringify(user.permissions), { expires: 7 });

            notifications.show({
                title: 'Success',
                message: response.message || 'Welcome back! You have successfully logged in.',
                color: 'green',
                icon: <IconCheck size={18} />,
            });

            router.push('/admin'); // Redirect to admin instead of dashboard
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
                        borderTop: `${rem(6)} solid var(--mantine-color-blue-6)`, // "viền quanh phía trên như timmycenter"
                        position: 'relative',
                    }}
                >
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
                            <Title order={2} fw={800} style={{ trackingTight: '-0.02em' }}>
                                Welcome to TimmyHub
                            </Title>
                            <Text c="dimmed" size="sm" mt={5}>
                                Please enter your details to sign in
                            </Text>
                        </Box>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="sm">
                                <TextInput
                                    label="Email"
                                    placeholder="Enter your email"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconAt size={16} stroke={1.5} />}
                                    {...form.getInputProps('email')}
                                />

                                <PasswordInput
                                    label="Password"
                                    placeholder="Enter your password"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconLock size={16} stroke={1.5} />}
                                    {...form.getInputProps('password')}
                                />

                                <Group justify="space-between" mt="xs">
                                    <Checkbox label="Remember me" style={{ cursor: 'pointer' }} />
                                    <Anchor href="/forgot-password" size="sm" fw={600}>
                                        Forgot password?
                                    </Anchor>
                                </Group>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    radius="md"
                                    mt="xl"
                                    loading={loginMutation.isPending}
                                    rightSection={<IconArrowRight size={18} />}
                                >
                                    Sign in
                                </Button>
                            </Stack>
                        </form>

                        <Text c="dimmed" size="sm" ta="center">
                            Don&apos;t have an account?{' '}
                            <Anchor href="/register" size="sm" fw={700}>
                                Register here
                            </Anchor>
                        </Text>
                    </Stack>
                </Paper>

                <Text mt="xl" c="dimmed" size="xs" ta="center">
                    &copy; 2026 TimmyHub. Secure Authentication.
                </Text>
            </Container>
        </Box>
    );
}
