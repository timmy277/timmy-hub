'use client';

import { useState } from 'react';
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
    useMantineTheme,
    TextInput,
    PasswordInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconLock, IconArrowRight } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export function LoginPage() {
    const theme = useMantineTheme();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            remember: false,
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (value.length < 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        console.log('Login values:', values);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            notifications.show({
                title: 'Success',
                message: 'You have successfully logged in!',
                color: 'blue',
            });
        }, 1500);
    };

    return (
        <Box
            className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950"
            style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, var(--mantine-color-gray-2) 1px, transparent 0)',
                backgroundSize: '40px 40px',
            }}
        >
            <Container size={420} className="w-full">
                <Paper
                    radius="xl"
                    p={{ base: 'lg', sm: 50 }}
                    withBorder
                    className="shadow-2xl border-zinc-200 dark:border-zinc-800"
                >

                    <Stack gap="xl">
                        <div className="text-center">
                            <Group justify="center" mb="md">
                                <Box
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                                    style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))' }}
                                >
                                    T
                                </Box>
                            </Group>
                            <Title order={2} className="tracking-tight font-bold">
                                Welcome back!
                            </Title>
                            <Text c="dimmed" size="sm" mt={5}>
                                Enter your credentials to access your account
                            </Text>
                        </div>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">
                                <TextInput
                                    label="Email address"
                                    placeholder="hello@gmail.com"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconAt size={16} />}
                                    {...form.getInputProps('email')}
                                />

                                <PasswordInput
                                    label="Password"
                                    placeholder="Your password"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconLock size={16} />}
                                    {...form.getInputProps('password')}
                                />

                                <Group justify="space-between" mt="xs">
                                    <Checkbox
                                        label="Remember me"
                                        {...form.getInputProps('remember', { type: 'checkbox' })}
                                        className="cursor-pointer"
                                    />
                                    <Anchor component="button" size="sm" fw={600} className="text-blue-600 hover:text-blue-700">
                                        Forgot password?
                                    </Anchor>
                                </Group>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    radius="md"
                                    mt="xl"
                                    loading={loading}
                                    rightSection={<IconArrowRight size={18} />}
                                    className="bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98]"
                                >
                                    Sign in
                                </Button>
                            </Stack>
                        </form>

                        <Text c="dimmed" size="sm" ta="center">
                            Don&apos;t have an account?{' '}
                            <Anchor component="button" size="sm" fw={700} className="text-blue-600">
                                Create account
                            </Anchor>
                        </Text>
                    </Stack>
                </Paper>

                <Text mt="xl" c="dimmed" size="xs" ta="center">
                    &copy; 2026 TimmyHub. All rights reserved.
                </Text>
            </Container>
        </Box>
    );
}
