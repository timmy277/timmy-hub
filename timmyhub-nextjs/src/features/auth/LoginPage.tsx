'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
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
    Center,
    Progress,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useInputState } from '@mantine/hooks';
import { IconAt, IconLock, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';

// --- Password Strength Components ---
const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
            <Center inline>
                {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
                <Box ml={7}>{label}</Box>
            </Center>
        </Text>
    );
}

// --- Validation Schema ---
const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export function LoginPage() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();
    const loginMutation = useLoginMutation();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            remember: false,
        },
        validate: zodResolver(schema),
    });

    // Handle Password Strength
    const strength = getStrength(form.values.password);
    const checks = requirements.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(form.values.password)} />
    ));
    const bars = Array(4)
        .fill(0)
        .map((_, index) => (
            <Progress
                styles={{ section: { transitionDuration: '0ms' } }}
                value={
                    form.values.password.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
                }
                color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
                key={index}
                size={4}
                aria-label={`Password strength segment ${index + 1}`}
            />
        ));

    const handleSubmit = async (values: z.infer<typeof schema>) => {
        try {
            const response = await loginMutation.mutateAsync(values);
            const { user, device } = response.data;

            // Lưu thông tin người dùng vào Store (Zustand persist)
            setAuth(user, device);

            notifications.show({
                title: 'Success',
                message: response.message || 'Welcome back! You have successfully logged in.',
                color: 'green',
                icon: <IconCheck size={18} />,
            });

            router.push('/dashboard');
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
                                        background: 'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))'
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

                                <Box>
                                    <PasswordInput
                                        label="Password"
                                        placeholder="Enter your password"
                                        size="md"
                                        radius="md"
                                        leftSection={<IconLock size={16} stroke={1.5} />}
                                        {...form.getInputProps('password')}
                                    />

                                    {/* Password Strength UI */}
                                    <Group gap={5} grow mt="xs" mb="md">
                                        {bars}
                                    </Group>

                                    <PasswordRequirement label="Has at least 6 characters" meets={form.values.password.length > 5} />
                                    {checks}
                                </Box>

                                <Group justify="space-between" mt="xs">
                                    <Checkbox
                                        label="Remember me"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <Anchor component="button" size="sm" fw={600}>
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
                            <Anchor component="button" size="sm" fw={700}>
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
