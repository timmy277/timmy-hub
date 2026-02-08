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
    TextInput,
    PasswordInput,
    rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconLock, IconArrowRight } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export function LoginPage() {
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
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--mantine-spacing-md)',
                backgroundColor: 'var(--mantine-color-body)',
                backgroundImage: 'radial-gradient(circle at 2px 2px, var(--mantine-color-gray-2) 1px, transparent 0)',
                backgroundSize: '40px 40px',
            }}
        >
            <Container size={420} w="100%">
                <Paper
                    radius="xl"
                    p={{ base: 'lg', sm: 50 }}
                    withBorder
                    style={{
                        boxShadow: 'var(--mantine-shadow-xl)',
                        borderColor: 'var(--mantine-color-default-border)',
                    }}
                >
                    <Stack gap="xl">
                        <Box ta="center">
                            <Group justify="center" mb="md">
                                <Box
                                    style={{
                                        width: rem(48),
                                        height: rem(48),
                                        borderRadius: 'var(--mantine-radius-xl)',
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
                                Welcome back!
                            </Title>
                            <Text c="dimmed" size="sm" mt={5}>
                                Enter your credentials to access your account
                            </Text>
                        </Box>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">
                                <TextInput
                                    label="Email address"
                                    placeholder="hello@gmail.com"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconAt size={16} stroke={1.5} />}
                                    {...form.getInputProps('email')}
                                />

                                <PasswordInput
                                    label="Password"
                                    placeholder="Your password"
                                    size="md"
                                    radius="md"
                                    leftSection={<IconLock size={16} stroke={1.5} />}
                                    {...form.getInputProps('password')}
                                />

                                <Group justify="space-between" mt="xs">
                                    <Checkbox
                                        label="Remember me"
                                        {...form.getInputProps('remember', { type: 'checkbox' })}
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
                                    loading={loading}
                                    rightSection={<IconArrowRight size={18} />}
                                    style={{
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    Sign in
                                </Button>
                            </Stack>
                        </form>

                        <Text c="dimmed" size="sm" ta="center">
                            Don&apos;t have an account?{' '}
                            <Anchor component="button" size="sm" fw={700}>
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
